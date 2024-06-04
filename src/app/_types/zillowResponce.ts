// To parse this data:
//
//   import { Convert, ZillowResponce } from "./file";
//
//   const zillowResponce = Convert.toZillowResponce(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface ZillowResponce {
  _declaration: Declaration;
  hotPadsItems: HotPadsItems;
}

export interface Declaration {
  _attributes: DeclarationAttributes;
}

export interface DeclarationAttributes {
  version: string;
  encoding: string;
}

export interface HotPadsItems {
  _attributes: HotPadsItemsAttributes;
  Company: Company[];
  Listing: Listing[];
}

export interface Company {
  _attributes: CompanyAttributes;
  name?: CompanyLogo;
  website: CompanyLogo;
  CompanyLogo?: CompanyLogo;
}

export interface CompanyLogo {
  _text?: string;
}

export interface CompanyAttributes {
  id: string;
}

export interface Listing {
  _attributes: ListingAttributes;
  unit: CompanyLogo;
  street: Street;
  city: CompanyLogo;
  state: CompanyLogo;
  zip: CompanyLogo;
  country: CompanyLogo;
  latitude: CompanyLogo;
  longitude: CompanyLogo;
  lastUpdated: CompanyLogo;
  contactName: CompanyLogo;
  contactEmail: CompanyLogo;
  contactPhone: CompanyLogo;
  contactTimes: CompanyLogo;
  contactMethodPreference: CompanyLogo;
  description?: CompanyLogo;
  leaseTerm: CompanyLogo;
  website: CompanyLogo;
  ListingTag: ListingTag[];
  price: CompanyLogo;
  pricingFrequency: CompanyLogo;
  deposit: CompanyLogo;
  numBedrooms: CompanyLogo;
  numFullBaths: CompanyLogo;
  numHalfBaths: CompanyLogo;
  squareFeet: CompanyLogo;
  dateAvailable: CompanyLogo;
  providerType: CompanyLogo;
  ListingPhoto?: ListingPhoto[];
  isFurnished?: CompanyLogo;
}

export interface ListingPhoto {
  _attributes: ListingPhotoAttributes;
}

export interface ListingPhotoAttributes {
  source: string;
}

export interface ListingTag {
  _attributes: ListingTagAttributes;
  tag: CompanyLogo;
}

export interface ListingTagAttributes {
  type: PurpleType;
}

export enum PurpleType {
  CatsAllowed = "CATS_ALLOWED",
  CoolingSystem = "COOLING_SYSTEM",
  DogsAllowed = "DOGS_ALLOWED",
  FloorCovering = "FLOOR_COVERING",
  HeatingSystem = "HEATING_SYSTEM",
  LargeDogsAllowed = "LARGE_DOGS_ALLOWED",
  Laundry = "LAUNDRY",
  ModelAmenity = "MODEL_AMENITY",
  ParkingSpaces = "PARKING_SPACES",
  ParkingType = "PARKING_TYPE",
  PropertyAmenity = "PROPERTY_AMENITY",
  RentIncludes = "RENT_INCLUDES",
  RoomType = "ROOM_TYPE",
  SmallDogsAllowed = "SMALL_DOGS_ALLOWED",
}

export interface ListingAttributes {
  id: string;
  type: FluffyType;
  companyId: string;
  propertyType: PropertyType;
}

export enum PropertyType {
  Condo = "CONDO",
  House = "HOUSE",
  Townhouse = "TOWNHOUSE",
}

export enum FluffyType {
  Rental = "RENTAL",
  Room = "ROOM",
}

export interface Street {
  _attributes: StreetAttributes;
  _text: string;
}

export interface StreetAttributes {
  hide: string;
}

export interface HotPadsItemsAttributes {
  version: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toZillowResponce(json: string): ZillowResponce {
    return cast(JSON.parse(json), r("ZillowResponce"));
  }

  public static zillowResponceToJson(value: ZillowResponce): string {
    return JSON.stringify(uncast(value, r("ZillowResponce")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : "";
  const keyText = key ? ` for key "${key}"` : "";
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`,
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(", ")}]`;
    }
  } else if (typeof typ === "object" && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = "",
  parent: any = "",
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent,
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l("Date"), val, key, parent);
    }
    return d;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  function transformObject(
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    props: { [k: string]: any },
    additional: any,
    val: any,
  ): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue(l(ref || "object"), val, key, parent);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === "object" && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty("props")
          ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  ZillowResponce: o(
    [
      { json: "_declaration", js: "_declaration", typ: r("Declaration") },
      { json: "hotPadsItems", js: "hotPadsItems", typ: r("HotPadsItems") },
    ],
    false,
  ),
  Declaration: o(
    [
      {
        json: "_attributes",
        js: "_attributes",
        typ: r("DeclarationAttributes"),
      },
    ],
    false,
  ),
  DeclarationAttributes: o(
    [
      { json: "version", js: "version", typ: "" },
      { json: "encoding", js: "encoding", typ: "" },
    ],
    false,
  ),
  HotPadsItems: o(
    [
      {
        json: "_attributes",
        js: "_attributes",
        typ: r("HotPadsItemsAttributes"),
      },
      { json: "Company", js: "Company", typ: a(r("Company")) },
      { json: "Listing", js: "Listing", typ: a(r("Listing")) },
    ],
    false,
  ),
  Company: o(
    [
      { json: "_attributes", js: "_attributes", typ: r("CompanyAttributes") },
      { json: "name", js: "name", typ: u(undefined, r("CompanyLogo")) },
      { json: "website", js: "website", typ: r("CompanyLogo") },
      {
        json: "CompanyLogo",
        js: "CompanyLogo",
        typ: u(undefined, r("CompanyLogo")),
      },
    ],
    false,
  ),
  CompanyLogo: o(
    [{ json: "_text", js: "_text", typ: u(undefined, "") }],
    false,
  ),
  CompanyAttributes: o([{ json: "id", js: "id", typ: "" }], false),
  Listing: o(
    [
      { json: "_attributes", js: "_attributes", typ: r("ListingAttributes") },
      { json: "unit", js: "unit", typ: r("CompanyLogo") },
      { json: "street", js: "street", typ: r("Street") },
      { json: "city", js: "city", typ: r("CompanyLogo") },
      { json: "state", js: "state", typ: r("CompanyLogo") },
      { json: "zip", js: "zip", typ: r("CompanyLogo") },
      { json: "country", js: "country", typ: r("CompanyLogo") },
      { json: "latitude", js: "latitude", typ: r("CompanyLogo") },
      { json: "longitude", js: "longitude", typ: r("CompanyLogo") },
      { json: "lastUpdated", js: "lastUpdated", typ: r("CompanyLogo") },
      { json: "contactName", js: "contactName", typ: r("CompanyLogo") },
      { json: "contactEmail", js: "contactEmail", typ: r("CompanyLogo") },
      { json: "contactPhone", js: "contactPhone", typ: r("CompanyLogo") },
      { json: "contactTimes", js: "contactTimes", typ: r("CompanyLogo") },
      {
        json: "contactMethodPreference",
        js: "contactMethodPreference",
        typ: r("CompanyLogo"),
      },
      {
        json: "description",
        js: "description",
        typ: u(undefined, r("CompanyLogo")),
      },
      { json: "leaseTerm", js: "leaseTerm", typ: r("CompanyLogo") },
      { json: "website", js: "website", typ: r("CompanyLogo") },
      { json: "ListingTag", js: "ListingTag", typ: a(r("ListingTag")) },
      { json: "price", js: "price", typ: r("CompanyLogo") },
      {
        json: "pricingFrequency",
        js: "pricingFrequency",
        typ: r("CompanyLogo"),
      },
      { json: "deposit", js: "deposit", typ: r("CompanyLogo") },
      { json: "numBedrooms", js: "numBedrooms", typ: r("CompanyLogo") },
      { json: "numFullBaths", js: "numFullBaths", typ: r("CompanyLogo") },
      { json: "numHalfBaths", js: "numHalfBaths", typ: r("CompanyLogo") },
      { json: "squareFeet", js: "squareFeet", typ: r("CompanyLogo") },
      { json: "dateAvailable", js: "dateAvailable", typ: r("CompanyLogo") },
      { json: "providerType", js: "providerType", typ: r("CompanyLogo") },
      {
        json: "ListingPhoto",
        js: "ListingPhoto",
        typ: u(undefined, a(r("ListingPhoto"))),
      },
      {
        json: "isFurnished",
        js: "isFurnished",
        typ: u(undefined, r("CompanyLogo")),
      },
    ],
    false,
  ),
  ListingPhoto: o(
    [
      {
        json: "_attributes",
        js: "_attributes",
        typ: r("ListingPhotoAttributes"),
      },
    ],
    false,
  ),
  ListingPhotoAttributes: o([{ json: "source", js: "source", typ: "" }], false),
  ListingTag: o(
    [
      {
        json: "_attributes",
        js: "_attributes",
        typ: r("ListingTagAttributes"),
      },
      { json: "tag", js: "tag", typ: r("CompanyLogo") },
    ],
    false,
  ),
  ListingTagAttributes: o(
    [{ json: "type", js: "type", typ: r("PurpleType") }],
    false,
  ),
  ListingAttributes: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "type", js: "type", typ: r("FluffyType") },
      { json: "companyId", js: "companyId", typ: "" },
      { json: "propertyType", js: "propertyType", typ: r("PropertyType") },
    ],
    false,
  ),
  Street: o(
    [
      { json: "_attributes", js: "_attributes", typ: r("StreetAttributes") },
      { json: "_text", js: "_text", typ: "" },
    ],
    false,
  ),
  StreetAttributes: o([{ json: "hide", js: "hide", typ: "" }], false),
  HotPadsItemsAttributes: o(
    [{ json: "version", js: "version", typ: "" }],
    false,
  ),
  PurpleType: [
    "CATS_ALLOWED",
    "COOLING_SYSTEM",
    "DOGS_ALLOWED",
    "FLOOR_COVERING",
    "HEATING_SYSTEM",
    "LARGE_DOGS_ALLOWED",
    "LAUNDRY",
    "MODEL_AMENITY",
    "PARKING_SPACES",
    "PARKING_TYPE",
    "PROPERTY_AMENITY",
    "RENT_INCLUDES",
    "ROOM_TYPE",
    "SMALL_DOGS_ALLOWED",
  ],
  PropertyType: ["CONDO", "HOUSE", "TOWNHOUSE"],
  FluffyType: ["RENTAL", "ROOM"],
};
