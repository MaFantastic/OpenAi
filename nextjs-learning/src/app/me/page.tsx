"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function MePage() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700 text-sm">加载中...</p>
      </main>
    );
  }

  const user = data?.user;
  const session = data?.session;

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-md text-center">
          <p className="text-slate-700 mb-4 text-sm">
            当前未登录，请先登录。
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            去登录
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4">
          用户信息
        </h1>

        <div className="space-y-2 text-sm text-slate-800 mb-6">
          <p>
            <span className="font-medium text-slate-600">用户 ID：</span>
            {user.id}
          </p>
          <p>
            <span className="font-medium text-slate-600">邮箱：</span>
            {user.email ?? "未提供"}
          </p>
          <p>
            <span className="font-medium text-slate-600">邮箱已验证：</span>
            {String(user.emailVerified ?? false)}
          </p>
          <p>
            <span className="font-medium text-slate-600">创建时间：</span>
            {user.createdAt ? new Date(user.createdAt).toLocaleString() : "未知"}
          </p>
          {user.updatedAt && (
            <p>
              <span className="font-medium text-slate-600">更新时间：</span>
              {new Date(user.updatedAt).toLocaleString()}
            </p>
          )}
          {user.name && (
            <p>
              <span className="font-medium text-slate-600">昵称：</span>
              {user.name}
            </p>
          )}
          {user.image && (
            <p className="flex items-center gap-2">
              <span className="font-medium text-slate-600">头像：</span>
              <img
                src={user.image}
                alt="avatar"
                className="h-10 w-10 rounded-full object-cover border border-slate-200"
              />
            </p>
          )}
          {session && (
            <>
              <p>
                <span className="font-medium text-slate-600">当前 Session ID：</span>
                {session.id}
              </p>
              <p>
                <span className="font-medium text-slate-600">Session 过期时间：</span>
                {session.expiresAt
                  ? new Date(session.expiresAt).toLocaleString()
                  : "未知"}
              </p>
            </>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-md bg-red-600 text-white py-2 text-sm font-medium hover:bg-red-700"
        >
          退出登录
        </button>
      </div>
    </main>
  );
}


