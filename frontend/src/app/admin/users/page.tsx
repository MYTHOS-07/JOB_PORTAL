import { EmptyState } from "@/components/common/EmptyState";
import { FilterBar, FilterInput, FilterSelect } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { roleLabels } from "@/lib/format";
import { firstParam, hrefWithQuery } from "@/lib/search";
import { serverApi } from "@/lib/server-api";
import type { ApiSuccess, PaginationMeta, Role, User } from "@/types/api";

const roles: Role[] = ["JOB_SEEKER", "EMPLOYER", "ADMIN"];

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const params = await searchParams;
  const search = firstParam(params.search);
  const role = firstParam(params.role);
  const page = Number(firstParam(params.page) ?? 1);

  const [usersResult, meResult] = await Promise.all([
    serverApi<ApiSuccess<User[]> & { pagination?: PaginationMeta }>("/admin/users", {
      auth: true,
      query: { page, limit: 12, search, role },
    }).catch(() => ({ data: [] as User[], pagination: undefined })),
    serverApi<ApiSuccess<User>>("/users/me", { auth: true }).catch(() => null),
  ]);

  const users = usersResult.data ?? [];

  return (
    <div>
      <DashHeader title="Users" text="Change roles, suspend accounts, and search the directory." />
      <FilterBar action="/admin/users" columns={3}>
        <FilterInput label="Search" name="search" defaultValue={search} placeholder="Name or email" />
        <FilterSelect
          label="Role"
          name="role"
          defaultValue={role}
          options={[
            { value: "", label: "All roles" },
            ...roles.map((value) => ({ value, label: roleLabels[value] })),
          ]}
        />
      </FilterBar>
      {users.length === 0 ? (
        <div className="rounded-xl border border-line bg-card p-6">
          <EmptyState title="No users found" text="Try a different name, email, or role." />
        </div>
      ) : (
        <AdminUsersTable items={users} currentUserId={meResult?.data.id} />
      )}
      <Pagination
        meta={usersResult.pagination}
        previousHref={hrefWithQuery("/admin/users", params, { page: (usersResult.pagination?.currentPage ?? 1) - 1 })}
        nextHref={hrefWithQuery("/admin/users", params, { page: (usersResult.pagination?.currentPage ?? 1) + 1 })}
      />
    </div>
  );
}
