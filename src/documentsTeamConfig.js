// Documents Team Configuration & Data Definitions

export const DOC_TEAM_DOWNLOAD_TYPES = ['CSV', 'PDF', 'XLS', 'RTF'];

export const DOCUMENTS_TEAM_SECTIONS = [
  { key: 'order-booking', label: 'Order & Booking', icon: '📦' },
  { key: 'invoice-shipment', label: 'Invoice & Shipment', icon: '📑' },
  { key: 'shipping-bill', label: 'Shipping Bill', icon: '📄' },
  { key: 'forwarding', label: 'Forwarding', icon: '🚢' },
  { key: 'clearing', label: 'Clearing', icon: '🚚' },
  { key: 'transport', label: 'Transport', icon: '🚛' },
  { key: 'fob-cost', label: 'FOB Cost', icon: '📊' },
  { key: 'payment-realisation', label: 'Payment & Realisation', icon: '💰' },
  { key: 'foreign-currency', label: 'Foreign Currency', icon: '💱' },
  { key: 'brc', label: 'BRC', icon: '📜' },
  { key: 'documents-reports', label: 'Documents Reports', icon: '📈' },
];

export const DOCUMENTS_TEAM_MENU = [
  {
    group: true, key: 'docTeamGroup', label: 'DOCUMENTS TEAM', icon: '📄',
    children: DOCUMENTS_TEAM_SECTIONS.map((sec) => ({
      key: sec.key,
      label: sec.label.toUpperCase(),
      icon: sec.icon,
      route: `/documents-team/${sec.key}`,
    })),
  },
];

export const BUYERS_LIST = ['Nike Global Retail', 'Adidas Sourcing Ltd', 'Puma Garments International', 'H&M Sourcing Asia', 'Zara / Inditex Group'];
export const MERCHANTS_LIST = ['Sana Malik', 'Ahmed Raza', 'Ali Hassan', 'Kamran Butt', 'Usman Tariq'];
export const TEAMS_LIST = ['Team Alpha', 'Team Export', 'Team Denim', 'Team Knits'];
export const UNITS_LIST = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4'];
export const SHPT_TERMS = ['FOB', 'CIF', 'CFR', 'EXW', 'DDP'];
export const SHPT_MODES = ['Air Freight', 'Sea Freight', 'Road Transport'];
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AED'];
export const FORWARDERS_LIST = ['DHL Express Global', 'FedEx International', 'Maersk Logistics', 'DB Schenker India', 'Kuehne + Nagel'];
export const CHA_LIST = ['Apex Freight Clearing', 'Continental Cargo CHA', 'Standard Logistics CHA'];
export const TRANSPORTERS_LIST = ['VRL Logistics', 'TCI Freight', 'Blue Dart Surface', 'GATI Express'];

// Initial Seed Data for each section

export const INITIAL_ORDER_BOOKINGS = [
  {
    id: 'ob-101',
    sNo: '1',
    delDt: '2026-09-25',
    ocnNo: 'OCN-2026-8801',
    season: 'Autumn / Winter 2026',
    buyer: 'Nike Global Retail',
    merchant: 'Sana Malik',
    team: 'Team Knits',
    unit: 'Unit 1',
    dcNo: 'DC-2026-901',
    orderNo: 'ORD-2026-4401',
    style: 'ST-1001',
    color: 'Navy Blue',
    fabric: '100% Combed Cotton Single Jersey',
    description: 'Men Round Neck T-Shirt',
    oQty: '12500',
    pcsPacksSets: 'Pcs',
    cur: 'USD',
    perPcsCur: '12.50',
    valueInCur: '156250.00',
    bookedConvRate: '83.50',
    bookedValueInr: '13046875.00',
    poDelDate: '2026-09-20',
    bookingDate: '2026-08-15',
    onlineBookingNo: 'ONB-99812',
    shptTerms: 'FOB',
    shptMode: 'Air Freight',
  },
  {
    id: 'ob-102',
    sNo: '2',
    delDt: '2026-10-05',
    ocnNo: 'OCN-2026-8802',
    season: 'Spring 2027',
    buyer: 'Adidas Sourcing Ltd',
    merchant: 'Ahmed Raza',
    team: 'Team Export',
    unit: 'Unit 2',
    dcNo: 'DC-2026-902',
    orderNo: 'ORD-2026-4402',
    style: 'ST-1002',
    color: 'Melange Grey',
    fabric: '95% Cotton 5% Spandex Pique',
    description: 'Men Polo Shirt',
    oQty: '8400',
    pcsPacksSets: 'Pcs',
    cur: 'EUR',
    perPcsCur: '14.00',
    valueInCur: '117600.00',
    bookedConvRate: '91.20',
    bookedValueInr: '10725120.00',
    poDelDate: '2026-09-30',
    bookingDate: '2026-08-20',
    onlineBookingNo: 'ONB-99815',
    shptTerms: 'CIF',
    shptMode: 'Sea Freight',
  },
];

export const INITIAL_INVOICE_SHIPMENTS = [
  {
    id: 'is-201',
    invoiceNo: 'EXP-INV-9901',
    invDate: '2026-09-10',
    shippedQty: '12500',
    ctns: '450',
    cbm: '38.5',
    buyerAgentCommPct: '2.5',
    commissionInValueFactoring: '3906.25',
    agnCommPerPcs: '0.31',
    factoringPct: '1.5',
    factoringCostPerPcs: '0.19',
    sPricePerPcs: '12.50',
    commValueFc: '3906.25',
    discPct: '1.0',
    discRebateValue: '1562.50',
    invValue: '154687.50',
    shippedAgainstInrValue: '12916406.25',
    excessShortQty: '0',
    excessShortPct: '0.0',
    pmtTerms: 'LC 60 Days',
    pol: 'JNPT Mumbai',
    pod: 'Rotterdam Port',
    finalDest: 'Hamburg Germany',
    blAwbNumber: 'BL-9908123',
    blAwbDate: '2026-09-12',
    etd: '2026-09-14',
    eta: '2026-10-04',
    blFcrRcvdDt: '2026-09-15',
  },
];

export const INITIAL_SHIPPING_BILLS = [
  {
    id: 'sb-301',
    sbNo: 'SB-8841029',
    date: '2026-09-11',
    freiht: '2500.00',
    comRebate: '1562.50',
    fobValueFc: '150625.00',
    hangerCost: '450.00',
    sbExRt: '83.45',
    fobValueInr: '12569656.25',
    hsCode: '61091000',
    dbkPct: '1.8',
    dbkAmt: '226253.81',
    rotdepPct: '1.2',
    rotdepAmt: '150835.88',
    rosctlPct: '3.5',
    amt: '439937.97',
    egmNo: 'EGM-99120',
    egmDate: '2026-09-15',
    dbkScrollNo: 'SCR-441029',
    scrollDate: '2026-09-20',
    dbkReceivedAmount: '226253.81',
    dbkReceivedDate: '2026-09-25',
    dbkDifference: '0.00',
  },
];

export const INITIAL_FORWARDING = [
  {
    id: 'fwd-401',
    billHodToIaFit: 'INW-FIT-2026-01 (10-09-2026)',
    forwarderName: 'DHL Express Global',
    bllNo: 'FWD-BILL-9901',
    date: '2026-09-12',
    billAmt: '85000.00',
    gst: '15300.00',
    nonGst: '0.00',
    forwardingCostPerPce: '6.80',
  },
];

export const INITIAL_CLEARING = [
  {
    id: 'clr-501',
    billHodToIaFit: 'INW-FIT-2026-02 (11-09-2026)',
    chaName: 'Apex Freight Clearing',
    billNo: 'CHA-INV-4410',
    date: '2026-09-13',
    billAmt: '32000.00',
    gst: '5760.00',
    nonGst: '0.00',
    clearingCostPerPce: '2.56',
    forwardingClearingCost: '117000.00',
    forwardingClearingCostPerPce: '9.36',
    forwardingClearingBudget: '125000.00',
    forwardingClearingBudgetPerPce: '10.00',
  },
];

export const INITIAL_TRANSPORT = [
  {
    id: 'trn-601',
    billHodToIaFit: 'INW-FIT-2026-03 (12-09-2026)',
    transporter: 'VRL Logistics',
    billNo: 'TRN-BILL-8821',
    date: '2026-09-14',
    billAmt: '45000.00',
    gst: '5400.00',
    nonGst: '0.00',
    tansportBillCostPerPce: '3.60',
    transportBudgetAmt: '50000.00',
    transportBudgetPerPce: '4.00',
    billHodToIa: 'Approved',
  },
];

export const INITIAL_FOB_COST = [
  {
    id: 'fob-701',
    totalBillFobCost: '162000.00',
    totalBilFobCostPce: '12.96',
    totalFobBudget: '175000.00',
    fobBudgetPce: '14.00',
    diffFobAmt: '-13000.00',
    diffFobPce: '-1.04',
  },
];

export const INITIAL_PAYMENT_REALISATION = [
  {
    id: 'pmt-801',
    billIdNo: 'BILL-ID-9901',
    date: '2026-09-20',
    discComInterestPct: '1.0',
    discComInterestAmt: '1546.88',
    remittacneAmt: '153140.62',
    remittacneDt: '2026-09-22',
    short: '0.00',
    realisedInCur1: '153140.62',
    realisedInCur2: '0.00',
    totalRealised: '153140.62',
    realizedDate: '2026-09-22',
    intermediateBankCharges: '150.00',
  },
];

export const INITIAL_FOREIGN_CURRENCY = [
  {
    id: 'fc-901',
    fcBookingNo: 'FC-BOOK-881',
    fcBookedRate: '83.50',
    fcBookedValue: '156250.00',
    fcRealisedExRt: '83.60',
    fcRealisedAmountInInr: '12802555.83',
    spotExRate: '83.55',
    spotRealisedAmountInr: '12794898.80',
    totalRealizedAmtInr: '12802555.83',
  },
];

export const INITIAL_BRC = [
  {
    id: 'brc-1001',
    brcNo: 'BRC-IND-2026-9901',
    brcDate: '2026-09-25',
    exRatePlusMinus: '+0.10',
  },
];
