const path = require('path');
const utilsPath = path.join(
  __dirname,
  '../../node_modules/.pnpm/@typescript-eslint+utils@8.46.3_eslint@9.39.1_typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/index.js',
);
const { ESLintUtils } = require(utilsPath);

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/your-org/your-repo/blob/main/docs/rules/${name}.md`,
);

module.exports = createRule({
  name: 'member-order-with-override',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce class member ordering with override methods at the end',
    },
    messages: {
      incorrectOrder: 'Member "{{member}}" should be declared {{position}}.',
      missingBlankLine: 'Expected blank line between class members.',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const ORDER_GROUPS = [
      {
        name: 'public instance fields',
        filter: (m) =>
          m.type === 'field' && !m.static && !m.abstract && m.accessibility === 'public',
      },
      {
        name: 'protected instance fields',
        filter: (m) =>
          m.type === 'field' && !m.static && !m.abstract && m.accessibility === 'protected',
      },
      {
        name: 'private instance fields',
        filter: (m) =>
          m.type === 'field' && !m.static && !m.abstract && m.accessibility === 'private',
      },

      {
        name: 'public static fields',
        filter: (m) => m.type === 'field' && m.static && m.accessibility === 'public',
      },
      {
        name: 'protected static fields',
        filter: (m) => m.type === 'field' && m.static && m.accessibility === 'protected',
      },
      {
        name: 'private static fields',
        filter: (m) => m.type === 'field' && m.static && m.accessibility === 'private',
      },

      {
        name: 'public abstract fields',
        filter: (m) => m.type === 'field' && m.abstract && m.accessibility === 'public',
      },
      {
        name: 'protected abstract fields',
        filter: (m) => m.type === 'field' && m.abstract && m.accessibility === 'protected',
      },

      {
        name: 'public abstract methods',
        filter: (m) =>
          m.type === 'method' && m.abstract && !m.override && m.accessibility === 'public',
      },
      {
        name: 'protected abstract methods',
        filter: (m) =>
          m.type === 'method' && m.abstract && !m.override && m.accessibility === 'protected',
      },

      {
        name: 'public constructor',
        filter: (m) => m.type === 'constructor' && m.accessibility === 'public',
      },
      {
        name: 'protected constructor',
        filter: (m) => m.type === 'constructor' && m.accessibility === 'protected',
      },
      {
        name: 'private constructor',
        filter: (m) => m.type === 'constructor' && m.accessibility === 'private',
      },

      {
        name: 'public static methods',
        filter: (m) =>
          m.type === 'method' && m.static && !m.override && m.accessibility === 'public',
      },
      {
        name: 'protected static methods',
        filter: (m) =>
          m.type === 'method' && m.static && !m.override && m.accessibility === 'protected',
      },
      {
        name: 'private static methods',
        filter: (m) =>
          m.type === 'method' && m.static && !m.override && m.accessibility === 'private',
      },

      {
        name: 'public instance methods',
        filter: (m) =>
          m.type === 'method' &&
          !m.static &&
          !m.abstract &&
          !m.override &&
          m.accessibility === 'public',
      },
      {
        name: 'protected instance methods',
        filter: (m) =>
          m.type === 'method' &&
          !m.static &&
          !m.abstract &&
          !m.override &&
          m.accessibility === 'protected',
      },
      {
        name: 'private instance methods',
        filter: (m) =>
          m.type === 'method' &&
          !m.static &&
          !m.abstract &&
          !m.override &&
          m.accessibility === 'private',
      },

      {
        name: 'public override methods',
        filter: (m) => m.type === 'method' && m.override && m.accessibility === 'public',
      },
      {
        name: 'protected override methods',
        filter: (m) => m.type === 'method' && m.override && m.accessibility === 'protected',
      },
      {
        name: 'private override methods',
        filter: (m) => m.type === 'method' && m.override && m.accessibility === 'private',
      },
    ];

    function getMemberInfo(node) {
      const isStatic = node.static || false;
      const isAbstract = node.abstract || node.type === 'TSAbstractMethodDefinition' || node.type === 'TSAbstractPropertyDefinition';
      const isOverride = node.override || false;

      let accessibility = 'public';
      if (node.accessibility) {
        accessibility = node.accessibility;
      }

      let type = 'method';
      if (node.type === 'PropertyDefinition' || node.type === 'TSAbstractPropertyDefinition') {
        type = 'field';
      } else if (node.type === 'MethodDefinition' && node.kind === 'constructor') {
        type = 'constructor';
      }

      const name = node.key?.name || (node.key?.type === 'Literal' ? node.key.value : 'unknown');

      return {
        type,
        static: isStatic,
        abstract: isAbstract,
        override: isOverride,
        accessibility,
        name,
        node,
      };
    }

    function getGroupIndex(member) {
      for (let i = 0; i < ORDER_GROUPS.length; i++) {
        if (ORDER_GROUPS[i].filter(member)) {
          return i;
        }
      }
      return ORDER_GROUPS.length;
    }

    function getPositionDescription(correctGroupIndex, maxGroupIndex) {
      if (correctGroupIndex === 0) {
        return 'at the beginning of the class';
      }

      const groupName = ORDER_GROUPS[correctGroupIndex].name;
      const previousGroupName = ORDER_GROUPS[maxGroupIndex].name;

      return `before all ${previousGroupName} (should be in ${groupName} section)`;
    }

    return {
      ClassBody(node) {
        const sourceCode = context.sourceCode;
        const members = node.body
          .filter(
            (member) =>
              member.type === 'PropertyDefinition' ||
              member.type === 'MethodDefinition' ||
              member.type === 'TSAbstractPropertyDefinition' ||
              member.type === 'TSAbstractMethodDefinition',
          )
          .map(getMemberInfo);

        const sortedMembers = [...members].sort((a, b) => {
          return getGroupIndex(a) - getGroupIndex(b);
        });

        const isCorrectOrder = members.every((member, index) => {
          return member === sortedMembers[index];
        });

        if (!isCorrectOrder) {
          let maxGroupIndex = -1;

          for (const member of members) {
            const currentGroupIndex = getGroupIndex(member);

            if (currentGroupIndex < maxGroupIndex) {
              context.report({
                node: node,
                messageId: 'incorrectOrder',
                data: {
                  member: member.name,
                  position: getPositionDescription(currentGroupIndex, maxGroupIndex),
                },
                fix(fixer) {
                  const memberTexts = sortedMembers.map((member) => {
                    const memberNode = member.node;
                    return sourceCode.getText(memberNode);
                  });

                  if (members.length === 0) {
                    return null;
                  }

                  const firstMember = members[0].node;
                  const lastMember = members[members.length - 1].node;
                  const rangeStart = firstMember.range[0];
                  const rangeEnd = lastMember.range[1];

                  const indentMatch = sourceCode.getText(firstMember).match(/^(\s*)/);
                  const indent = indentMatch ? indentMatch[1] : '';

                  const newText = memberTexts.join('\n\n' + indent);

                  return fixer.replaceTextRange([rangeStart, rangeEnd], newText);
                },
              });
              break;
            }

            maxGroupIndex = Math.max(maxGroupIndex, currentGroupIndex);
          }
        }

        for (let i = 0; i < members.length - 1; i++) {
          const currentMember = members[i].node;
          const nextMember = members[i + 1].node;

          const currentEnd = currentMember.range[1];
          const nextStart = nextMember.range[0];
          const textBetween = sourceCode.text.slice(currentEnd, nextStart);

          const linesBetween = textBetween.split('\n').length - 1;

          if (linesBetween < 2) {
            context.report({
              node: nextMember,
              messageId: 'missingBlankLine',
              fix(fixer) {
                const currentLine = sourceCode.getLastToken(currentMember);
                const nextLine = sourceCode.getFirstToken(nextMember);

                if (!currentLine || !nextLine) {
                  return null;
                }

                const indentMatch = sourceCode.getText(nextMember).match(/^(\s*)/);
                const indent = indentMatch ? indentMatch[1] : '';

                return fixer.replaceTextRange(
                  [currentEnd, nextStart],
                  '\n\n' + indent
                );
              },
            });
          }
        }
      },
    };
  },
});

