// Replace with API calls when the backend is wired up.
import { T } from '../syntax';

export const SAMPLES = {
  java: {
    label: 'Java', file: 'MyService.java', lineCount: 15,
    original: [
      [T('kw', 'public '), T('type', 'List'), T('punct', '<'), T('type', 'String'), T('punct', '> '), T('fn', 'getActiveUsers'), T('punct', '('), T('type', 'List'), T('punct', '<'), T('type', 'User'), T('punct', '> '), T('var', 'users'), T('punct', ') {')],
      [T('plain', '    '), T('type', 'List'), T('punct', '<'), T('type', 'String'), T('punct', '> '), T('var', 'result'), T('punct', ' = '), T('kw', 'new '), T('type', 'ArrayList'), T('punct', '<>();')],
      [T('plain', '    '), T('kw', 'for '), T('punct', '('), T('type', 'int'), T('punct', ' '), T('var', 'i'), T('punct', ' = '), T('num', '0'), T('punct', '; '), T('var', 'i'), T('punct', ' < '), T('var', 'users'), T('punct', '.'), T('fn', 'size'), T('punct', '(); '), T('var', 'i'), T('punct', '++) {')],
      [T('plain', '        '), T('type', 'User'), T('punct', ' '), T('var', 'u'), T('punct', ' = '), T('var', 'users'), T('punct', '.'), T('fn', 'get'), T('punct', '('), T('var', 'i'), T('punct', ');')],
      [T('plain', '        '), T('kw', 'if '), T('punct', '('), T('var', 'u'), T('punct', ' != '), T('kw', 'null'), T('punct', ') {')],
      [T('plain', '            '), T('kw', 'if '), T('punct', '('), T('var', 'u'), T('punct', '.'), T('fn', 'isActive'), T('punct', '()) {')],
      [T('plain', '                '), T('kw', 'if '), T('punct', '('), T('var', 'u'), T('punct', '.'), T('fn', 'getEmail'), T('punct', '() != '), T('kw', 'null'), T('punct', ') {')],
      [T('plain', '                    '), T('var', 'result'), T('punct', '.'), T('fn', 'add'), T('punct', '('), T('var', 'u'), T('punct', '.'), T('fn', 'getEmail'), T('punct', '());')],
      [T('plain', '                '), T('punct', '}')],
      [T('plain', '            '), T('punct', '}')],
      [T('plain', '        '), T('punct', '}')],
      [T('plain', '    '), T('punct', '}')],
      [T('plain', '    '), T('kw', 'return '), T('var', 'result'), T('punct', ';')],
      [T('punct', '}')],
    ],
  },
  python: {
    label: 'Python', file: 'service.py', lineCount: 13,
    original: [
      [T('kw', 'def '), T('fn', 'get_active_users'), T('punct', '('), T('var', 'users'), T('punct', '):')],
      [T('plain', '    '), T('var', 'result'), T('punct', ' = []')],
      [T('plain', '    '), T('kw', 'for '), T('var', 'i'), T('kw', ' in '), T('fn', 'range'), T('punct', '('), T('fn', 'len'), T('punct', '('), T('var', 'users'), T('punct', ')):')],
      [T('plain', '        '), T('var', 'u'), T('punct', ' = '), T('var', 'users'), T('punct', '['), T('var', 'i'), T('punct', ']')],
      [T('plain', '        '), T('kw', 'if '), T('var', 'u'), T('kw', ' is not '), T('kw', 'None'), T('punct', ':')],
      [T('plain', '            '), T('kw', 'if '), T('var', 'u'), T('punct', '.'), T('var', 'is_active'), T('punct', ':')],
      [T('plain', '                '), T('kw', 'if '), T('var', 'u'), T('punct', '.'), T('var', 'email'), T('kw', ' is not '), T('kw', 'None'), T('punct', ':')],
      [T('plain', '                    '), T('var', 'result'), T('punct', '.'), T('fn', 'append'), T('punct', '('), T('var', 'u'), T('punct', '.'), T('var', 'email'), T('punct', ')')],
      [T('plain', '    '), T('kw', 'return '), T('var', 'result')],
    ],
  },
  typescript: {
    label: 'TypeScript', file: 'service.ts', lineCount: 14,
    original: [
      [T('kw', 'function '), T('fn', 'getActiveUsers'), T('punct', '('), T('var', 'users'), T('punct', ': '), T('type', 'User'), T('punct', '[]): '), T('type', 'string'), T('punct', '[] {')],
      [T('plain', '  '), T('kw', 'const '), T('var', 'result'), T('punct', ': '), T('type', 'string'), T('punct', '[] = [];')],
      [T('plain', '  '), T('kw', 'for '), T('punct', '('), T('kw', 'let '), T('var', 'i'), T('punct', ' = '), T('num', '0'), T('punct', '; '), T('var', 'i'), T('punct', ' < '), T('var', 'users'), T('punct', '.'), T('var', 'length'), T('punct', '; '), T('var', 'i'), T('punct', '++) {')],
      [T('plain', '    '), T('kw', 'const '), T('var', 'u'), T('punct', ' = '), T('var', 'users'), T('punct', '['), T('var', 'i'), T('punct', '];')],
      [T('plain', '    '), T('kw', 'if '), T('punct', '('), T('var', 'u'), T('punct', ' !== '), T('kw', 'null'), T('punct', ') {')],
      [T('plain', '      '), T('kw', 'if '), T('punct', '('), T('var', 'u'), T('punct', '.'), T('var', 'isActive'), T('punct', ') {')],
      [T('plain', '        '), T('kw', 'if '), T('punct', '('), T('var', 'u'), T('punct', '.'), T('var', 'email'), T('punct', ') {')],
      [T('plain', '          '), T('var', 'result'), T('punct', '.'), T('fn', 'push'), T('punct', '('), T('var', 'u'), T('punct', '.'), T('var', 'email'), T('punct', ');')],
      [T('plain', '        '), T('punct', '}')],
      [T('plain', '      '), T('punct', '}')],
      [T('plain', '    '), T('punct', '}')],
      [T('plain', '  '), T('punct', '}')],
      [T('plain', '  '), T('kw', 'return '), T('var', 'result'), T('punct', ';')],
      [T('punct', '}')],
    ],
  },
};

export const LANGUAGES = [['java', 'Java'], ['python', 'Python'], ['typescript', 'TypeScript']];
