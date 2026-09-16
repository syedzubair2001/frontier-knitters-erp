/**
 * Customer module — data contract / model layer.
 *
 * Single source of truth for the Customer record used across the UI, the data
 * service and (documented) API + DB layers. Written in plain JS with JSDoc
 * typedefs so every consumer shares one shape. No `any` used anywhere.
 *
 * @typedef {{
 *   id: string,
 *   address1: string,
 *   address2: string,
 *   address3: string,
 *   city: string,
 *   country: string,
 *   phone: string,
 *   contact: string,
 *   transport: string
 * }} Address
 *
 * @typedef {{
 *   id: string,
 *   category: string,
 *   name: string,
 *   aliasName: string,
 *   lookup: boolean,
 *   taxCategory: string,
 *   commissionPct: string,
 *   extPct: string,
 *   payTerm: string,
 *   acLedger: string,
 *   agent: string,
 *   currency: string,
 *   isActive: boolean,
 *   lotMixing: boolean,
 *   prospective: boolean,
 *   createLedger: boolean,
 *   manager: string,
 *   merchandiser: string,
 *   team: string,
 *   addresses: Address[],
 *   createdAt: string,
 *   updatedAt: string
 * }} Customer
 */

// Dropdown option lists (documented defaults — editable later)
export const CUSTOMER_CATEGORIES = ['Local', 'Export', 'Indentor'];
export const TAX_CATEGORIES = ['General', 'Export', 'Exempt'];
export const PAY_TERMS = ['Cash', 'Credit 30 Days', 'Credit 60 Days', 'LC'];
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'AED'];

// Address grid columns in display order
export const ADDRESS_FIELDS = ['address1', 'address2', 'address3', 'city', 'country', 'phone', 'contact', 'transport'];

export const ADDRESS_LABELS = {
  address1: 'Address1', address2: 'Address2', address3: 'Address3', city: 'City',
  country: 'Country', phone: 'Phone', contact: 'Contact', transport: 'Transport',
};

/** Create a blank Address record (identity-free, DB assigns id). */
export function makeAddress(over = {}) {
  return {
    address1: '',
    address2: '',
    address3: '',
    city: '',
    country: '',
    phone: '',
    contact: '',
    transport: '',
    ...over,
  };
}

/** Create a blank Customer record with defaults matching the form. */
export function makeCustomer(over = {}) {
  return {
    id: '',
    category: CUSTOMER_CATEGORIES[0],
    name: '',
    aliasName: '',
    lookup: false,
    taxCategory: TAX_CATEGORIES[0],
    commissionPct: '',
    extPct: '',
    payTerm: PAY_TERMS[0],
    acLedger: '',
    agent: '',
    currency: CURRENCIES[0],
    isActive: true,
    lotMixing: false,
    prospective: false,
    createLedger: false,
    manager: '',
    merchandiser: '',
    team: '',
    addresses: [],
    createdAt: '',
    updatedAt: '',
    ...over,
  };
}

/**
 * Shared validation rules (mirrored for the backend in docs/customer-api.md).
 * Returns `{ ok, errors }` where errors maps field name -> message.
 * @param {Customer} c
 * @returns {{ok: boolean, errors: Record<string, string>}}
 */
export function validateCustomer(c) {
  const errors = {};
  if (!c.name || !c.name.trim()) errors.name = 'Name is required';
  if (!c.category) errors.category = 'Category is required';
  if (typeof c.commissionPct === 'string' && c.commissionPct.trim() !== '' && (isNaN(Number(c.commissionPct)) || Number(c.commissionPct) < 0)) {
    errors.commissionPct = 'Commission % must be 0 or more';
  }
  if (typeof c.extPct === 'string' && c.extPct.trim() !== '' && (isNaN(Number(c.extPct)) || Number(c.extPct) < 0)) {
    errors.extPct = 'Ext % must be 0 or more';
  }
  return { ok: !Object.keys(errors).length, errors };
}