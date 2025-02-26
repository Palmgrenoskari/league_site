// Cache for item data
let itemDataCache: any = null;

export async function getItemData() {
  if (itemDataCache) {
    return itemDataCache;
  }

  try {
    const response = await fetch(
      "https://ddragon.leagueoflegends.com/cdn/15.4.1/data/en_US/item.json"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch item data");
    }

    const data = await response.json();
    itemDataCache = data.data;
    return itemDataCache;
  } catch (error) {
    console.error("Error fetching item data:", error);
    return null;
  }
}
