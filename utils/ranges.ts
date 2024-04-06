
/**
 * @param input The input to be symmetrically compressed on range [0, 1]
 * @param compression The overall compression, so 0.2 will yield an output on
 * [0, 1] from an input on [0.1, 0.9]
 * @returns The output, compressed and then shifted to hold at 0 from
 * [0, compression / 2] and 1 from [1 - compression / 2], providing the full output
 * range of [0, 1] on [compression / 2, 1 - compression / 2]
 */
export const compressRangeSymmetric = (input: number, compression: number) => {
  const shiftedInput = Math.max(0, (input - compression / 2));
  const compressedOutput = shiftedInput / (1 - compression);

  return Math.min(1, compressedOutput);
}
