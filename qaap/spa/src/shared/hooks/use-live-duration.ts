import { useEffect, useState } from "react";

import { formatMs } from "@/shared/utils/format";

export function useLiveDuration(
  startTime: string,
  endTime?: string | null,
  isActive?: boolean,
): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : now;
  return formatMs(end - start);
}
