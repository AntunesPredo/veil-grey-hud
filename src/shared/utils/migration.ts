/* eslint-disable @typescript-eslint/no-explicit-any */
export function migrateCharacterToV2(state: any): any {
  if (!state) return state;

  const migrated = { ...state };

  if (Array.isArray(migrated.inventory)) {
    migrated.inventory = migrated.inventory.map((item: any) => ({
      ...item,
      id: String(item.id),
      parentId:
        item.parentId !== null && item.parentId !== undefined
          ? String(item.parentId)
          : null,
    }));
  }

  if (Array.isArray(migrated.customEffects)) {
    migrated.customEffects = migrated.customEffects.map((effect: any) => ({
      ...effect,
      id: String(effect.id),
      link:
        effect.link !== null && effect.link !== undefined
          ? String(effect.link)
          : null,
    }));
  }

  if (Array.isArray(migrated.notes)) {
    migrated.notes = migrated.notes.map((note: any) => ({
      ...note,
      id: String(note.id),
    }));
  }

  if (Array.isArray(migrated.usedInjectIds)) {
    migrated.usedInjectIds = migrated.usedInjectIds.map((id: any) =>
      String(id),
    );
  }

  return migrated;
}

export function migrateMasterToV2(state: any): any {
  if (!state) return state;

  const migrated = { ...state };

  if (Array.isArray(migrated.globalItems)) {
    migrated.globalItems = migrated.globalItems.map((item: any) => ({
      ...item,
      id: String(item.id),
      parentId:
        item.parentId !== null && item.parentId !== undefined
          ? String(item.parentId)
          : null,
    }));
  }

  if (Array.isArray(migrated.globalEffects)) {
    migrated.globalEffects = migrated.globalEffects.map((effect: any) => ({
      ...effect,
      id: String(effect.id),
      link:
        effect.link !== null && effect.link !== undefined
          ? String(effect.link)
          : null,
    }));
  }

  if (Array.isArray(migrated.folders)) {
    migrated.folders = migrated.folders.map((folder: any) => ({
      ...folder,
      id: String(folder.id),
    }));
  }

  return migrated;
}
