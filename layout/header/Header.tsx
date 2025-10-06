import Link from "next/link";
import React from "react";

type Props = {};

function Header({}: Props) {
  return (
    <div className="p-4 text-center ">
      <h1 className="text-3xl font-bold">English Practice</h1>
      <p className="text-sm text-gray-600">
        Hoàn thành từng câu — hệ thống sửa từng câu rồi mới chuyển tiếp.
      </p>
      <div className="flex flex-row items-center justify-center gap-2">
        <Link
          href={"/"}
          className="text-gray-700 hover:underline hover:text-blue-400"
        >
          Home{" "}
        </Link>
        <Link
          href={"/write"}
          className="text-gray-700 hover:underline hover:text-blue-400"
        >
          Writing{" "}
        </Link>
        <Link
          href={"/speaking"}
          className="text-gray-700 hover:underline hover:text-blue-400"
        >
          Speaking{" "}
        </Link>
      </div>
    </div>
  );
}

export default Header;
