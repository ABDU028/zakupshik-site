/* Detalka — общие данные прототипа: машины, демо-склад, наценка, заказы.
   ВАЖНО: каталог и цены — ДЕМО. Реальный адаптер склада (Шате-М API) заменит stockSearch(). */
(function () {
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('dtl_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dtl_' + k, JSON.stringify(v)); } catch (e) {} },
  };

  const BRANDS = {
    Toyota: ['Camry 50', 'Camry 70', 'Corolla 150', 'Corolla 180', 'RAV4 40', 'Land Cruiser Prado 150', 'Land Cruiser 200'],
    Lexus: ['RX 350', 'LX 570', 'ES 250'],
    Hyundai: ['Accent', 'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Creta'],
    Kia: ['Rio', 'Cerato', 'K5', 'Sportage', 'Sorento'],
    Chevrolet: ['Cobalt', 'Nexia', 'Malibu', 'Onix'],
    Lada: ['Granta', 'Vesta', 'Niva Travel'],
    Volkswagen: ['Polo', 'Passat', 'Tiguan'],
    Nissan: ['Almera', 'Qashqai', 'X-Trail'],
    Mitsubishi: ['Outlander', 'Pajero', 'Lancer'],
  };
  const WMI = { JT: 'Toyota', '4T': 'Toyota', '2T': 'Toyota', JTJ: 'Lexus', '2T2': 'Lexus', KMH: 'Hyundai', Z94: 'Hyundai', KNA: 'Kia', KNE: 'Kia', XWE: 'Kia',
    XTA: 'Lada', XUU: 'Chevrolet', XWB: 'Chevrolet', KL1: 'Chevrolet', WVW: 'Volkswagen', XW8: 'Volkswagen', JN1: 'Nissan', SJN: 'Nissan', Z8N: 'Nissan', JMB: 'Mitsubishi', JA4: 'Mitsubishi' };
  const YEAR = { A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017, J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025, T: 2026, 1: 2001, 2: 2002, 3: 2003, 4: 2004, 5: 2005, 6: 2006, 7: 2007, 8: 2008, 9: 2009, Y: 2000 };
  function decodeVin(vin) {
    vin = (vin || '').toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    if (vin.length !== 17) return { ok: false, vin, err: 'VIN — 17 знаков (латиница и цифры, без I, O, Q)' };
    const brand = WMI[vin.slice(0, 3)] || WMI[vin.slice(0, 2)] || null;
    return { ok: true, vin, brand, year: YEAR[vin[9]] || null };
  }

  const CATS = [
    { id: 'to', name: 'ТО и фильтры', ico: 'filter' }, { id: 'brake', name: 'Тормоза', ico: 'disc' },
    { id: 'susp', name: 'Подвеска', ico: 'spring' }, { id: 'engine', name: 'Двигатель', ico: 'piston' },
    { id: 'elec', name: 'Электрика', ico: 'plug' }, { id: 'body', name: 'Кузов и оптика', ico: 'lamp' },
    { id: 'oil', name: 'Масла и жидкости', ico: 'drop' }, { id: 'acc', name: 'Аксессуары', ico: 'star' },
  ];

  // демо-каталог: деталь → варианты (оригинал/аналоги). fit: какие марки (пусто = универсально)
  const P = (id, cat, name, fit, variants, kw) => ({ id, cat, name, fit, variants, kw: (kw || '') + ' ' + name.toLowerCase() });
  const V = (brand, num, cost, stock, kind, eta) => ({ brand, num, cost, stock, kind: kind || 'аналог', eta: eta || 'today' });
  const CATALOG = [
    P('oilf', 'to', 'Фильтр масляный', ['Toyota', 'Lexus'], [V('Toyota', '04152-YZZA1', 4200, 34, 'оригинал'), V('Mann', 'HU 7019 z', 3100, 18), V('Bosch', 'F 026 407 209', 2700, 9)], 'масло фильтр то'),
    P('oilf2', 'to', 'Фильтр масляный', ['Hyundai', 'Kia'], [V('Hyundai/Kia', '26300-35505', 2600, 50, 'оригинал'), V('Mann', 'W 811/80', 1900, 22), V('Mahle', 'OC 500', 1700, 12)], 'масло фильтр то'),
    P('airf', 'to', 'Фильтр воздушный', ['Toyota', 'Lexus'], [V('Toyota', '17801-0V020', 6900, 11, 'оригинал'), V('Mann', 'C 26 003', 4300, 15), V('Filtron', 'AP 183/6', 3200, 7)], 'воздух фильтр то'),
    P('airf2', 'to', 'Фильтр воздушный', ['Hyundai', 'Kia'], [V('Hyundai/Kia', '28113-F2000', 5200, 20, 'оригинал'), V('Mann', 'C 27 002', 3600, 10)], 'воздух фильтр то'),
    P('cabf', 'to', 'Фильтр салона угольный', [], [V('Bosch', '1 987 435 584', 4100, 25), V('Mann', 'CUK 1919', 4600, 14), V('Filtron', 'K 1329A', 2900, 30)], 'салон фильтр кондиционер то'),
    P('pads', 'brake', 'Колодки тормозные передние', ['Toyota', 'Lexus'], [V('Toyota', '04465-33471', 24800, 6, 'оригинал'), V('Brembo', 'P 83 117', 17900, 8), V('Akebono', 'AN-8187WK', 16200, 4), V('TRW', 'GDB 7708', 13800, 12)], 'колодки тормоз перед'),
    P('pads2', 'brake', 'Колодки тормозные передние', ['Hyundai', 'Kia'], [V('Hyundai/Kia', '58101-F2A00', 18500, 9, 'оригинал'), V('Mando', 'MPH56', 11900, 16), V('Sangsin', 'SP1401', 8900, 20)], 'колодки тормоз перед'),
    P('disc', 'brake', 'Диск тормозной передний', ['Toyota', 'Lexus'], [V('Toyota', '43512-33130', 41500, 3, 'оригинал'), V('Brembo', '09.A913.11', 26900, 6), V('TRW', 'DF 6231', 21800, 4)], 'диск тормоз перед'),
    P('shock', 'susp', 'Амортизатор передний правый', ['Toyota'], [V('Toyota', '48510-80469', 89000, 2, 'оригинал', '1d'), V('KYB', '339382', 42500, 5), V('Sachs', '317 557', 39800, 3), V('Tokico', 'B3302', 36900, 0, 'аналог', '2d')], 'амортизатор стойка подвеска перед'),
    P('shock2', 'susp', 'Амортизатор передний левый', ['Toyota'], [V('Toyota', '48520-80409', 89000, 2, 'оригинал', '1d'), V('KYB', '339383', 42500, 5), V('Sachs', '317 558', 39800, 2)], 'амортизатор стойка подвеска перед'),
    P('shock3', 'susp', 'Амортизатор передний', ['Hyundai', 'Kia'], [V('Hyundai/Kia', '54651-F2000', 52000, 4, 'оригинал'), V('Mando', 'EX54651F2000', 31500, 7), V('KYB', '3348032', 34900, 3)], 'амортизатор стойка подвеска перед'),
    P('link', 'susp', 'Стойка стабилизатора передняя', [], [V('CTR', 'CLT-61', 5900, 40), V('555', 'SL-T080', 6800, 22), V('Lemförder', '38231 01', 11900, 6)], 'стойка стабилизатора линк косточка подвеска'),
    P('arm', 'susp', 'Рычаг передний нижний', ['Toyota'], [V('Toyota', '48068-33060', 78000, 1, 'оригинал', '1d'), V('CTR', 'CQT-56R', 29500, 4), V('Lemförder', '38412 01', 41000, 2)], 'рычаг подвеска'),
    P('spark', 'engine', 'Свеча зажигания (комплект 4 шт)', ['Toyota', 'Lexus'], [V('Denso', 'FK20HBR8', 28800, 16, 'оригинал'), V('NGK', 'ILKAR7B11', 26400, 20)], 'свеча зажигания свечи'),
    P('spark2', 'engine', 'Свеча зажигания (комплект 4 шт)', ['Hyundai', 'Kia', 'Chevrolet', 'Lada', 'Volkswagen', 'Nissan'], [V('NGK', 'LZKR6B-10E', 14800, 40), V('Bosch', 'FR7DCX+', 9600, 35)], 'свеча зажигания свечи'),
    P('belt', 'engine', 'Ремень приводной поликлиновой', [], [V('Gates', '6PK1875', 9800, 12), V('Contitech', '6PK1880', 10400, 9), V('Dayco', '6PK1875', 8900, 6)], 'ремень генератора приводной'),
    P('pump', 'engine', 'Помпа водяная', ['Toyota'], [V('Toyota', '16100-39466', 58000, 2, 'оригинал', '1d'), V('Aisin', 'WPT-190', 36500, 4), V('GMB', 'GWT-151A', 27900, 3)], 'помпа насос охлаждение'),
    P('batt', 'elec', 'Аккумулятор 75 Ач', [], [V('Varta', 'Blue Dynamic E11', 64000, 8), V('Bosch', 'S4 008', 61000, 6), V('Topla', 'Energy 75', 52000, 10)], 'аккумулятор акб батарея'),
    P('lamp', 'elec', 'Лампа H11 (2 шт)', [], [V('Philips', 'X-tremeVision', 9900, 30), V('Osram', 'Night Breaker', 10900, 25)], 'лампа фара свет h11'),
    P('wiper', 'body', 'Щётки стеклоочистителя (пара)', [], [V('Bosch', 'Aerotwin A297S', 12900, 18), V('Valeo', 'Silencio', 11500, 14), V('Denso', 'DFR-007', 9800, 9)], 'дворники щетки'),
    P('head', 'body', 'Фара передняя левая', ['Toyota'], [V('Toyota', '81185-33D50', 245000, 0, 'оригинал', '5d'), V('Depo', '212-11T4L', 98000, 2)], 'фара свет оптика'),
    P('oil', 'oil', 'Масло моторное 5W-30, 4 л', [], [V('Toyota', '08880-10705', 24900, 30, 'оригинал'), V('Mobil 1', 'ESP 5W-30', 27900, 22), V('Shell', 'Helix Ultra', 23500, 40), V('ZIC', 'X9 5W-30', 16900, 50)], 'масло моторное 5w30'),
    P('anti', 'oil', 'Антифриз G12, 5 л', [], [V('Felix', 'Carbox G12+', 8900, 40), V('Sintec', 'Lux G12', 7400, 35)], 'антифриз охлаждающая жидкость тосол'),
    P('mat', 'acc', 'Коврики салона 3D', [], [V('Lux', '3D EVA', 19900, 12), V('Norplast', 'Полиуретан', 16500, 8)], 'коврики салон'),
  ];

  const DEF_MARKUP = { base: 15, cheap: 25, expensive: 10, cheapMax: 10000, expMin: 80000, delivery: 1500, freeFrom: 50000 };
  function settings() { return Object.assign({}, DEF_MARKUP, LS.get('markup', {})); }
  function priceOf(cost) {
    const s = settings();
    const pct = cost <= s.cheapMax ? s.cheap : cost >= s.expMin ? s.expensive : s.base;
    return Math.ceil(cost * (1 + pct / 100) / 100) * 100;
  }
  const ETA = { today: 'Сегодня', '1d': 'Завтра', '2d': '2 дня', '5d': '5 дней' };

  // Агент наличия на сервере: опрашивает всех поставщиков сразу. Если сервер недоступен — локальное демо.
  const AGENT = (() => { try { return localStorage.getItem('dtl_agent_override'); } catch (e) { return null; } })() || 'https://tqhigjvyoqtwukqqnlmb.supabase.co/functions/v1/parts-agent';
  async function agentSearch(q, car, adminKey) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 12000);
    try {
      const r = await fetch(AGENT, { method: 'POST', signal: ctl.signal, headers: Object.assign({ 'Content-Type': 'application/json' }, adminKey ? { 'x-admin': adminKey } : {}),
        body: JSON.stringify({ q, car: car ? { brand: car.brand, model: car.model, year: car.year, vin: car.vin } : null }) });
      if (!r.ok) throw new Error('agent ' + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }
  async function stockSearch(q, car) {
    try {
      const j = await agentSearch(q, car);
      if (j && Array.isArray(j.products)) return j.products.map(p => ({ ...p, kw: '', variants: [] }));
    } catch (e) { /* сервер недоступен — показываем локальное демо */ }
    return localSearch(q, car);
  }
  async function localSearch(q, car) {
    await new Promise(r => setTimeout(r, 450 + Math.random() * 400));
    q = (q || '').toLowerCase().trim();
    const words = q.split(/\s+/).filter(Boolean);
    const qn = q.replace(/[\s\-.]/g, '');
    const out = [];
    for (const p of CATALOG) {
      if (car && car.brand && p.fit.length && !p.fit.includes(car.brand)) continue;
      const byNum = qn.length >= 4 && p.variants.some(v => v.num.toLowerCase().replace(/[\s\-.]/g, '').includes(qn));
      const byText = words.length && words.every(w => p.kw.includes(w) || p.name.toLowerCase().includes(w));
      const byCat = !q;
      if (byNum || byText || byCat) out.push(p);
    }
    return out.map(p => ({ ...p, offers: p.variants.map(v => ({ ...v, price: priceOf(v.cost), supplier: 'Шате-М (демо)' })).sort((a, b) => (b.stock > 0) - (a.stock > 0) || a.price - b.price) }));
  }

  const ORDER_STEPS = ['Оплачен', 'Заказан на складе', 'Едет к нам', 'У курьера', 'Доставлен'];
  function orders() { return LS.get('orders', []); }
  function saveOrders(o) { LS.set('orders', o); }
  function requests() { return LS.get('requests', []); }
  function saveRequests(r) { LS.set('requests', r); }

  window.DTL = { AGENT, agentSearch, LS, BRANDS, CATS, CATALOG, decodeVin, stockSearch, priceOf, settings, DEF_MARKUP, ETA, ORDER_STEPS, orders, saveOrders, requests, saveRequests };
})();
