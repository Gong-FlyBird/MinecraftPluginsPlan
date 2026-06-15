/**
 * 数据迁移系统
 * 
 * store 中存 `_version` 字段，每次 schema 变更时加一条迁移函数。
 * 加载旧数据时自动执行未完成的迁移。
 */

const CURRENT_VERSION = 2;

const MIGRATIONS = {
  2: (data) => {
    if (!data.bookmarkCollections) {
      data.bookmarkCollections = [{ id: 'default', name: '我的收藏', pluginIds: [], createdAt: Date.now() }];
    }
    return data;
  },
};

/**
 * 执行迁移
 * @param {object} data - 原始 store 数据
 * @returns {object} 迁移后的数据
 */
export function migrateData(data) {
  if (!data || typeof data !== 'object') return data;

  const version = data._version || 0;

  if (version >= CURRENT_VERSION) return data;

  let migrated = { ...data };

  for (let v = version + 1; v <= CURRENT_VERSION; v++) {
    const fn = MIGRATIONS[v];
    if (fn) {
      try {
        migrated = fn(migrated);
      } catch (e) {
        console.warn(`Migration v${v} failed:`, e);
      }
    }
    migrated._version = v;
  }

  return migrated;
}

export { CURRENT_VERSION };
