import { describe, expect, it } from 'vitest';
import { envelope, readShared, toShareCode } from './share';

describe('share codes', () => {
  it('round-trips through a code', async () => {
    const env = envelope('test-app', 1, [{ id: 'a', name: 'Wrexham save', notes: 'ünïcode ✓' }]);
    const code = await toShareCode('TST', env);
    expect(code.startsWith('TST:')).toBe(true);
    const back = await readShared('TST', 'test-app', code);
    expect(back.items).toEqual(env.items);
  });

  it('reads plain JSON backups', async () => {
    const env = envelope('test-app', 1, [{ id: 'b' }]);
    const back = await readShared('TST', 'test-app', JSON.stringify(env));
    expect(back.items[0]).toEqual({ id: 'b' });
  });

  it('rejects other apps and damaged codes', async () => {
    const other = JSON.stringify(envelope('other', 1, []));
    await expect(readShared('TST', 'test-app', other)).rejects.toThrow(/different app/);
    await expect(readShared('TST', 'test-app', 'TST:@@@')).rejects.toThrow(/damaged/);
    await expect(readShared('TST', 'test-app', 'hello')).rejects.toThrow(/isn't a backup/);
  });
});
