import { countEvents } from "./db.js";

export const PAGE_SIZE = 10;

export async function pagingInfo(pageQuery: string) {
  let page = Number.parseInt(pageQuery, 10);

  if (page < 1 || Number.isNaN(page)) {
    page = 1;
  }

  const count = await countEvents();

  const paging = {
    page,
    count,
    hasNext: page * PAGE_SIZE < count,
    next: page + 1,
    hasPrevious: page > 1,
    previous: page - 1,
    total: Math.ceil(count / PAGE_SIZE),
  };

  return paging;
}
