declare module 'color-namer' {
  interface ColorName {
    name: string;
    hex: string;
    distance: number;
  }

  interface ColorNames {
    basic: ColorName[];
    ntc: ColorName[];
    roygbiv: ColorName[];
    pantone: ColorName[];
  }

  function colorNamer(color: string): ColorNames;
  export default colorNamer;
}
