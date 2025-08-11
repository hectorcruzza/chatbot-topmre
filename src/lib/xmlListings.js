export async function loadListings() {
  const res = await fetch("/exampleFeed.xml");
  const xml = await res.text();

  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const list = [...doc.querySelectorAll("Adverts > Advert")].map((ad) => {
    const text = (sel) => ad.querySelector(sel)?.textContent?.trim() ?? "";
    const num = (sel) => Number(text(sel)) || 0;

    const titleEs =
      ad.querySelector('Titles > Title[Language="es"]')?.textContent?.trim() ||
      ad.querySelector("Titles > Title")?.textContent?.trim() ||
      "";
    const descEs =
      ad
        .querySelector('Descriptions > Description[Language="es"]')
        ?.textContent?.trim() ||
      ad.querySelector("Descriptions > Description")?.textContent?.trim() ||
      "";

    return {
      id: text("AdvertId"),
      city: text("City"),
      subType: text("SubType"),
      price: num("Price"),
      currency: text("PriceCurrency"),
      bedrooms: text("Bedrooms"),
      bathrooms: text("Bathrooms"),
      photo: ad.querySelector("Photos > Photo")?.textContent?.trim() ?? "",
      title: titleEs,
      description: descEs,
      link: "",
    };
  });

  return list;
}

export function filterListings(list, { zona, presupuesto, currency, tipo }) {
  const max = Number(String(presupuesto).replace(/[^\d]/g, "")) || 0;

  const USD_TO_MXN = 18.5;
  const MXN_TO_USD = 1 / USD_TO_MXN;

  const norm = (s) =>
    s
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const wantCity = norm(zona);
  const wantType = norm(tipo);
  const wantCur = (currency || "").toUpperCase();

  return list
    .filter((p) => {
      const cityOk = norm(p.city) === wantCity;
      const typeOk = norm(p.subType) === wantType;
      let maxComparable = max;

      if (p.currency.toUpperCase() !== wantCur) {
        if (wantCur === "MXN" && p.currency.toUpperCase() === "USD") {
          maxComparable = max * MXN_TO_USD;
        } else if (wantCur === "USD" && p.currency.toUpperCase() === "MXN") {
          maxComparable = max * USD_TO_MXN;
        }
      }

      const priceOk = maxComparable ? p.price <= maxComparable : true;
      return cityOk && typeOk && priceOk;
    })
    .map((p) => {
      let convertedPrice = null;
      if (p.currency.toUpperCase() !== wantCur) {
        if (p.currency.toUpperCase() === "USD" && wantCur === "MXN") {
          convertedPrice = `${(p.price * USD_TO_MXN).toLocaleString()} MXN`;
        } else if (p.currency.toUpperCase() === "MXN" && wantCur === "USD") {
          convertedPrice = `${(p.price * MXN_TO_USD).toLocaleString()} USD`;
        }
      }
      return { ...p, convertedPrice };
    })
    .slice(0, 10);
}
