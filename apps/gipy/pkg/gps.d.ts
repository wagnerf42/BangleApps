/* tslint:disable */
/* eslint-disable */
export function disable_elevation(gps: Gps): void;
export function get_gps_map_svg(gps: Gps): string;
export function get_polygon(gps: Gps): Float64Array;
export function has_heights(gps: Gps): boolean;
export function get_polyline(gps: Gps): Float64Array;
export function get_gps_content(gps: Gps): Uint8Array;
export function request_map(gps: Gps, key1: string, value1: string, key2: string, value2: string, key3: string, value3: string, key4: string, value4: string): Promise<void>;
export function load_gps_from_string(input: string, autodetect_waypoints: boolean): Gps;
export function gps_from_area(xmin: number, ymin: number, xmax: number, ymax: number, ski: boolean): Gps;
export class Gps {
  private constructor();
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_gps_free: (a: number, b: number) => void;
  readonly disable_elevation: (a: number) => void;
  readonly get_gps_map_svg: (a: number) => [number, number];
  readonly get_polygon: (a: number) => [number, number];
  readonly has_heights: (a: number) => number;
  readonly get_polyline: (a: number) => [number, number];
  readonly get_gps_content: (a: number) => [number, number];
  readonly request_map: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number) => any;
  readonly load_gps_from_string: (a: number, b: number, c: number) => number;
  readonly gps_from_area: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_6: WebAssembly.Table;
  readonly closure314_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure332_externref_shim: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
