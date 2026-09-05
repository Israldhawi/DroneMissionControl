import { useSearchParams } from "react-router-dom";

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface UsePaginationResult {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export function usePagination(
  total: number,
  pageSize = 10,
): UsePaginationResult {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const rawPage = Number(
    searchParams.get("page") ?? "1",
  );

  const page =
    Number.isInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize),
  );

  function updatePage(nextPage: number) {
    const safePage = Math.min(
      Math.max(nextPage, 1),
      totalPages,
    );

    const nextParams = new URLSearchParams(
      searchParams,
    );

    if (safePage === 1) {
      nextParams.delete("page");
    } else {
      nextParams.set(
        "page",
        String(safePage),
      );
    }

    setSearchParams(nextParams);
  }

  function setPage(nextPage: number) {
    updatePage(nextPage);
  }

  function nextPage() {
    if (page < totalPages) {
      updatePage(page + 1);
    }
  }

  function previousPage() {
    if (page > 1) {
      updatePage(page - 1);
    }
  }

  const state: PaginationState = {
    page,
    pageSize,
    total,
  };

  return {
    page: state.page,
    pageSize: state.pageSize,
    total: state.total,
    totalPages,
    setPage,
    nextPage,
    previousPage,
  };
}
