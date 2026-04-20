import type { ItemType } from "../types/veil-grey";

const ICON_DB = {
  MATERIAL: [
    {
      id: "mat_gear",
      svg: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    },
    {
      id: "mat_chip",
      svg: (
        <path d="M21 11V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z" />
      ),
    },
  ],
  CONSUMABLE: [
    {
      id: "cons_pill",
      svg: (
        <path d="M16 3H8c-2.76 0-5 2.24-5 5v8c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5V8c0-2.76-2.24-5-5-5zm-5 14H9v-4h2v4zm0-6H9V7h2v4zm4 6h-2v-4h2v4zm0-6h-2V7h2v4z" />
      ),
    },
    {
      id: "cons_food",
      svg: (
        <path d="M18 4H6v2h12V4zm1 3H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-1 9H6V9h12v7z" />
      ),
    },
    {
      id: "cons_ammo",
      svg: (
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 16H7v-2h6v2zm0-4H7V8h6v6zm0-8H7V4h6v2z" />
      ),
    },
  ],
  RECHARGEABLE: [
    {
      id: "rech_mag",
      svg: (
        <path d="M17 4h-2V2H9v2H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-2 14H9v-2h6v2zm0-4H9v-2h6v2zm0-4H9V8h6v2z" />
      ),
    },
    {
      id: "rech_flask",
      svg: (
        <path d="M14.5 4H13V2h-2v2H9.5C8.67 4 8 4.67 8 5.5v13c0 .83.67 1.5 1.5 1.5h5c.83 0 1.5-.67 1.5-1.5v-13c0-.83-.67-1.5-1.5-1.5zM14 18h-4v-3h4v3zm0-5h-4V9h4v4z" />
      ),
    },
  ],
  ACTIVE: [
    {
      id: "act_gun",
      svg: (
        <path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 18H7v-3H4v-2h5v5zm11-7h-3v2h5v-5h-2v3z" />
      ),
    },
    {
      id: "act_knife",
      svg: (
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
      ),
    },
  ],
  KIT: [
    {
      id: "kit_med",
      svg: (
        <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm6 11h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z" />
      ),
    },
    {
      id: "kit_tool",
      svg: (
        <path d="M21.71 20.29l-1.42 1.42a1 1 0 0 1-1.41 0L12 14.83l-6.88 6.88a1 1 0 0 1-1.41 0l-1.42-1.42a1 1 0 0 1 0-1.41l6.88-6.88L2.29 5.12a1 1 0 0 1 0-1.41l1.42-1.42a1 1 0 0 1 1.41 0l6.88 6.88 6.88-6.88a1 1 0 0 1 1.41 0l1.42 1.42a1 1 0 0 1 0 1.41L14.83 12l6.88 6.88a1 1 0 0 1 0 1.41z" />
      ),
    },
  ],
  CONTAINER: [
    {
      id: "cont_box",
      svg: (
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v-2H4v6h16v-6h-2v2h-2v-5h-2v5z" />
      ),
    },
  ],
  EQUIPABLE: [
    {
      id: "eqp_armor",
      svg: (
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 3.99-2.58 7.78-6 8.8-3.42-1.02-6-4.81-6-8.8V6.43l6-2.25z" />
      ),
    },
    {
      id: "eqp_bag",
      svg: (
        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
      ),
    },
  ],
};

export function useCustomSvgIcons() {
  const getCategoryIcons = (type: ItemType) => ICON_DB[type] || [];

  const getSpecificSvg = (id: string) => {
    for (const category of Object.values(ICON_DB)) {
      const found = category.find((icon) => icon.id === id);
      if (found) return found.svg;
    }
    return (
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    );
  };

  return { getCategoryIcons, getSpecificSvg };
}
