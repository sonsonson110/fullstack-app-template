import type { PaginationMeta } from "@/api/response-type";
import { userApi } from "@/api/user";
import { columns } from "@/app-admin/users/user-list/columns";
import { Pagination } from "@/components/custom/pagination";
import SortableListInput, {
  type SortItem,
} from "@/components/custom/sortable-list-input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useBreadcrumbEffect } from "@/context/breadcrumb";
import type { QueryParams } from "@/types/pagination-query-params";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import React from "react";
import { useNavigate } from "react-router";

export function UsersPage() {
  const [paginationMeta, setPaginationMeta] = React.useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortItem[]>([]);

  const navigate = useNavigate();

  const { isPending, isError, error, data, isFetching, refetch } = useQuery({
    queryKey: ["users", paginationMeta.page, paginationMeta.limit],
    queryFn: () => {
      const sortBy: string[] = [],
        sortOrder: string[] = [];
      sort.forEach((item) => {
        sortBy.push(item.value);
        sortOrder.push(item.order);
      });
      return userApi.getUsers({
        page: paginationMeta.page,
        limit: paginationMeta.limit,
        search: search || undefined,
        sortBy: sortBy.length ? sortBy : undefined,
        sortOrder: sortOrder.length ? sortOrder : undefined,
      } as QueryParams);
    },
    placeholderData: keepPreviousData,
  });

  React.useEffect(() => {
    if (data?.meta) {
      setPaginationMeta(data.meta);
    }
  }, [data?.meta]);

  useBreadcrumbEffect([
    { title: "General management", href: "/admin" },
    { title: "Users" },
  ]);

  const sortFields = React.useMemo(
    () => [
      { label: "Username", value: "username" },
      { label: "Email", value: "email" },
      { label: "Created at", value: "createdAt" },
      { label: "Updated at", value: "updatedAt" },
    ],
    []
  ) satisfies { label: string; value: string }[];

  const onSumitSearch = () => refetch();

  return (
    <div className="flex flex-1 flex-col gap-4 pb-9">
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="text-muted-foreground">
        Manage your users here. You can add, edit, and deactive, ban and manage
        user active session.
      </p>

      <Separator />

      {isPending ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : isError ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h3 className="font-medium">Error loading users</h3>
          <p>{error?.message || "Something went wrong. Please try again."}</p>
        </div>
      ) : (
        <div className="relative flex flex-col gap-4">
          {isFetching && !isPending && (
            <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search by username or email..."
                className="w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="default" onClick={onSumitSearch}>
                Submit
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <SortableListInput
                value={sort}
                onChange={(sortItems) => setSort(sortItems)}
                availableItems={sortFields}
              />
            </div>
          </div>
          <DataTable
            columns={columns((userId) => {
              navigate(userId);
            })}
            data={Array.isArray(data?.data) ? data.data : []}
          />
        </div>
      )}
      <Pagination
        pagination={paginationMeta}
        onPaginationChange={(meta) => setPaginationMeta(meta)}
      />
    </div>
  );
}
