/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
// To parse this data:
//
//   import { Convert, ResponseZumper } from "./file";
//
//   const responseZumper = Convert.toResponseZumper(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface ResponseZumper {
  _declaration: Declaration;
  properties: Properties;
}

export interface Declaration {
  _attributes: Attributes;
}

export interface Attributes {
  version: string;
  encoding: string;
}

export interface Properties {
  property: Property[];
}

export interface Property {
  status: HasGarage;
  "listing-type": HasGarage;
  location: Location;
  details: Details;
  "landing-page": LandingPage;
  site: Site;
  pictures: Pictures;
  "property-manager": PropertyManager;
  "detailed-characteristics": DetailedCharacteristics;
  "has-garage": HasGarage;
  "parking-types": ParkingTypes;
  "rental-terms": RentalTerm[];
  "total-unit-parking-spaces"?: HasGarage;
}

export interface DetailedCharacteristics {
  furnished: HasGarage;
  appliances: Appliances;
  "other-amenities": OtherAmenities;
}

export interface Appliances {
  "has-washer": HasGarage[] | HasGarage;
  "has-dryer"?: HasGarage;
}

export interface HasGarage {
  _text?: string;
}

export interface OtherAmenities {
  "other-amenity"?: HasGarage[] | HasGarage;
}

export interface Details {
  "provider-listingid": HasGarage;
  "property-type": HasGarage;
  price: HasGarage;
  "num-bedrooms": HasGarage;
  "num-bathrooms": HasGarage;
  "num-half-bathrooms": HasGarage;
  "living-area-square-feet": HasGarage;
  description: HasGarage;
  "date-available": HasGarage;
}

export interface LandingPage {
  "lp-url": HasGarage;
}

export interface Location {
  "unit-number": HasGarage;
  "display-address": HasGarage;
  "street-address": HasGarage;
  "city-name": HasGarage;
  zipcode: HasGarage;
  country: HasGarage;
  "state-code": HasGarage;
  longitude: HasGarage;
  latitude: HasGarage;
}

export interface ParkingTypes {
  "parking-type": HasGarage[] | HasGarage;
}

export interface Pictures {
  picture?: Picture[];
}

export interface Picture {
  "picture-url": HasGarage;
  "picture-seq-number": HasGarage;
}

export interface PropertyManager {
  "property-manager-name": HasGarage;
  "property-manager-website": HasGarage;
  "property-manager-phone": HasGarage;
  "property-manager-email": HasGarage;
  "property-manager-logo-url"?: HasGarage;
}

export interface RentalTerm {
  "price-term"?: HasGarage;
  "rental-type": HasGarage;
  "lease-type": HasGarage;
  "lease-min-length-months": HasGarage;
  "lease-periods"?: LeasePeriods;
  pets: Pets;
  "utilities-included"?: Record<string, HasGarage>;
  price?: HasGarage;
  "security-deposit"?: HasGarage;
}

export interface LeasePeriods {
  "lease-period": HasGarage[] | HasGarage;
  "security-deposit": HasGarage[] | HasGarage;
}

export interface Pets {
  "small-dogs-allowed": HasGarage;
  "large-dogs-allowed": HasGarage;
  "cats-allowed": HasGarage;
  "pet-other-allowed"?: HasGarage;
  "pet-comment"?: HasGarage;
}

export interface Site {
  "site-url": HasGarage;
  "site-name": HasGarage;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toResponseZumper(json: string): ResponseZumper {
    return cast(JSON.parse(json), r("ResponseZumper"));
  }

  public static responseZumperToJson(value: ResponseZumper): string {
    return JSON.stringify(uncast(value, r("ResponseZumper")), null, 2);
  }
}

function invalidValue(
  typ: any,
  val: any,
  key: unknown,
  parent: any = "",
): never {
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
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function l(typ: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
  ResponseZumper: o(
    [
      { json: "_declaration", js: "_declaration", typ: r("Declaration") },
      { json: "properties", js: "properties", typ: r("Properties") },
    ],
    false,
  ),
  Declaration: o(
    [{ json: "_attributes", js: "_attributes", typ: r("Attributes") }],
    false,
  ),
  Attributes: o(
    [
      { json: "version", js: "version", typ: "" },
      { json: "encoding", js: "encoding", typ: "" },
    ],
    false,
  ),
  Properties: o(
    [{ json: "property", js: "property", typ: a(r("Property")) }],
    false,
  ),
  Property: o(
    [
      { json: "status", js: "status", typ: r("HasGarage") },
      { json: "listing-type", js: "listing-type", typ: r("HasGarage") },
      { json: "location", js: "location", typ: r("Location") },
      { json: "details", js: "details", typ: r("Details") },
      { json: "landing-page", js: "landing-page", typ: r("LandingPage") },
      { json: "site", js: "site", typ: r("Site") },
      { json: "pictures", js: "pictures", typ: r("Pictures") },
      {
        json: "property-manager",
        js: "property-manager",
        typ: r("PropertyManager"),
      },
      {
        json: "detailed-characteristics",
        js: "detailed-characteristics",
        typ: r("DetailedCharacteristics"),
      },
      { json: "has-garage", js: "has-garage", typ: r("HasGarage") },
      { json: "parking-types", js: "parking-types", typ: r("ParkingTypes") },
      { json: "rental-terms", js: "rental-terms", typ: a(r("RentalTerm")) },
      {
        json: "total-unit-parking-spaces",
        js: "total-unit-parking-spaces",
        typ: u(undefined, r("HasGarage")),
      },
    ],
    false,
  ),
  DetailedCharacteristics: o(
    [
      { json: "furnished", js: "furnished", typ: r("HasGarage") },
      { json: "appliances", js: "appliances", typ: r("Appliances") },
      {
        json: "other-amenities",
        js: "other-amenities",
        typ: r("OtherAmenities"),
      },
    ],
    false,
  ),
  Appliances: o(
    [
      {
        json: "has-washer",
        js: "has-washer",
        typ: u(a(r("HasGarage")), r("HasGarage")),
      },
      { json: "has-dryer", js: "has-dryer", typ: u(undefined, r("HasGarage")) },
    ],
    false,
  ),
  HasGarage: o([{ json: "_text", js: "_text", typ: u(undefined, "") }], false),
  OtherAmenities: o(
    [
      {
        json: "other-amenity",
        js: "other-amenity",
        typ: u(undefined, u(a(r("HasGarage")), r("HasGarage"))),
      },
    ],
    false,
  ),
  Details: o(
    [
      {
        json: "provider-listingid",
        js: "provider-listingid",
        typ: r("HasGarage"),
      },
      { json: "property-type", js: "property-type", typ: r("HasGarage") },
      { json: "price", js: "price", typ: r("HasGarage") },
      { json: "num-bedrooms", js: "num-bedrooms", typ: r("HasGarage") },
      { json: "num-bathrooms", js: "num-bathrooms", typ: r("HasGarage") },
      {
        json: "num-half-bathrooms",
        js: "num-half-bathrooms",
        typ: r("HasGarage"),
      },
      {
        json: "living-area-square-feet",
        js: "living-area-square-feet",
        typ: r("HasGarage"),
      },
      { json: "description", js: "description", typ: r("HasGarage") },
      { json: "date-available", js: "date-available", typ: r("HasGarage") },
    ],
    false,
  ),
  LandingPage: o(
    [{ json: "lp-url", js: "lp-url", typ: r("HasGarage") }],
    false,
  ),
  Location: o(
    [
      { json: "unit-number", js: "unit-number", typ: r("HasGarage") },
      { json: "display-address", js: "display-address", typ: r("HasGarage") },
      { json: "street-address", js: "street-address", typ: r("HasGarage") },
      { json: "city-name", js: "city-name", typ: r("HasGarage") },
      { json: "zipcode", js: "zipcode", typ: r("HasGarage") },
      { json: "country", js: "country", typ: r("HasGarage") },
      { json: "state-code", js: "state-code", typ: r("HasGarage") },
      { json: "longitude", js: "longitude", typ: r("HasGarage") },
      { json: "latitude", js: "latitude", typ: r("HasGarage") },
    ],
    false,
  ),
  ParkingTypes: o(
    [
      {
        json: "parking-type",
        js: "parking-type",
        typ: u(a(r("HasGarage")), r("HasGarage")),
      },
    ],
    false,
  ),
  Pictures: o(
    [{ json: "picture", js: "picture", typ: u(undefined, a(r("Picture"))) }],
    false,
  ),
  Picture: o(
    [
      { json: "picture-url", js: "picture-url", typ: r("HasGarage") },
      {
        json: "picture-seq-number",
        js: "picture-seq-number",
        typ: r("HasGarage"),
      },
    ],
    false,
  ),
  PropertyManager: o(
    [
      {
        json: "property-manager-name",
        js: "property-manager-name",
        typ: r("HasGarage"),
      },
      {
        json: "property-manager-website",
        js: "property-manager-website",
        typ: r("HasGarage"),
      },
      {
        json: "property-manager-phone",
        js: "property-manager-phone",
        typ: r("HasGarage"),
      },
      {
        json: "property-manager-email",
        js: "property-manager-email",
        typ: r("HasGarage"),
      },
      {
        json: "property-manager-logo-url",
        js: "property-manager-logo-url",
        typ: u(undefined, r("HasGarage")),
      },
    ],
    false,
  ),
  RentalTerm: o(
    [
      {
        json: "price-term",
        js: "price-term",
        typ: u(undefined, r("HasGarage")),
      },
      { json: "rental-type", js: "rental-type", typ: r("HasGarage") },
      { json: "lease-type", js: "lease-type", typ: r("HasGarage") },
      {
        json: "lease-min-length-months",
        js: "lease-min-length-months",
        typ: r("HasGarage"),
      },
      {
        json: "lease-periods",
        js: "lease-periods",
        typ: u(undefined, r("LeasePeriods")),
      },
      { json: "pets", js: "pets", typ: r("Pets") },
      {
        json: "utilities-included",
        js: "utilities-included",
        typ: u(undefined, m(r("HasGarage"))),
      },
      { json: "price", js: "price", typ: u(undefined, r("HasGarage")) },
      {
        json: "security-deposit",
        js: "security-deposit",
        typ: u(undefined, r("HasGarage")),
      },
    ],
    false,
  ),
  LeasePeriods: o(
    [
      {
        json: "lease-period",
        js: "lease-period",
        typ: u(a(r("HasGarage")), r("HasGarage")),
      },
      {
        json: "security-deposit",
        js: "security-deposit",
        typ: u(a(r("HasGarage")), r("HasGarage")),
      },
    ],
    false,
  ),
  Pets: o(
    [
      {
        json: "small-dogs-allowed",
        js: "small-dogs-allowed",
        typ: r("HasGarage"),
      },
      {
        json: "large-dogs-allowed",
        js: "large-dogs-allowed",
        typ: r("HasGarage"),
      },
      { json: "cats-allowed", js: "cats-allowed", typ: r("HasGarage") },
      {
        json: "pet-other-allowed",
        js: "pet-other-allowed",
        typ: u(undefined, r("HasGarage")),
      },
      {
        json: "pet-comment",
        js: "pet-comment",
        typ: u(undefined, r("HasGarage")),
      },
    ],
    false,
  ),
  Site: o(
    [
      { json: "site-url", js: "site-url", typ: r("HasGarage") },
      { json: "site-name", js: "site-name", typ: r("HasGarage") },
    ],
    false,
  ),
};
