import { useEffect, useState } from "react";

export const useResizeValue = <TValue>(getValue: () => TValue) => {
  const [value, setValue] = useState<TValue>(getValue());

  useEffect(() => {
    const handleResize = () => setValue(getValue());

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [getValue]);

  return value;
}
