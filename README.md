# Na Rynku — první mobilní verze

Statický one-page web podle dodaného PDF. Bez frameworku a bez instalace závislostí.
Na větší obrazovce zůstává mobilní sloupec o šířce nejvýše 520 px.

## Spuštění

V této složce spusťte `npm run dev` a otevřete `http://127.0.0.1:4173`.
Kontrola JavaScriptu: `npm run check`.

## Náhled na telefonu ve stejné Wi-Fi

1. Připojte počítač i telefon ke stejné důvěryhodné síti (ne oddělené síti pro hosty).
2. V nadřazené složce spusťte dvojklikem `START_SERVER.bat`. Staré okno serveru nejdřív zavřete.
3. Nechte okno otevřené a v telefonu otevřete adresu vypsanou pod `Open on your phone`, např. `http://192.168.1.20:4173/`.
4. Pokud Windows zobrazí dotaz firewallu, povolte Node.js pouze pro soukromou síť. Firewall nevypínejte.

Server naslouchá na `0.0.0.0:4173` a zpřístupňuje jen obsah `dist`, nikoli projektové podklady. Pokud se IP adresa nevypíše, najdete IPv4 počítače v nastavení Wi-Fi ve Windows. Některé sítě izolují zařízení a místní náhled na nich nebude dostupný. Nejde o veřejný internetový odkaz a po vypnutí počítače nebo serveru přestane fungovat.

## Soubory

- `index.html`: obsah a sekce stránky.
- `styles.css`: vzhled, fonty a animace.
- `app.js`: kategorie menu, fotografie a ukázková rezervace.
- `menu-focus.js`: ovládání a zobrazení detailu menu.
- `assets/`: připravené místní fotky, logo z PDF a fonty.
- `tools/prepare_assets.py`: opakovatelné zpracování podkladů z nadřazené složky, vyžaduje Pillow a Poppler.

## Co je pracovní

Jídla, ceny, gramáže, texty a alergeny jsou ilustrační a nesmějí být použity jako skutečný jídelní lístek bez ověření restaurací.
Kontakty, adresu a otevírací dobu je potřeba doplnit. První fotografie karuselu ukazuje jídlo, druhá kuchyň: další skutečné fotky specialit doplníme podle dostupných podkladů.

Rezervace je výhradně demonstrace. Volba data, času a počtu hostů zobrazí jen místní shrnutí. Neověřuje dostupnost, nevytváří skutečnou rezervaci, nic neodesílá a nic neukládá.

Stránka respektuje omezený pohyb, umožňuje pozastavit karusel a funguje i bez externích služeb. Navigace a základní jídelní lístek jsou použitelné také bez JavaScriptu.
