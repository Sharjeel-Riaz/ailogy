import React from "react";
import { TEMPLATE } from "./TemplateListSection";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

function TemplateCard(item: TEMPLATE) {
  return (
    <Link href={"/dashboard/content/" + item?.slug}>
      <div
        className="p-5 shadow-md rounded-md border bg-white flex flex-col
    gap-3 cursor-pointer hover:scale-105 transition-all
    "
        key={uuidv4()}
      >
        <img
          src={item.icon}
          alt="icon"
          width={50}
          height={50}
          className="object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://img.icons8.com/color/96/file.png";
          }}
        />
        <h2 className="font-medium text-lg line-clamp-1">{item.name}</h2>
        <p className="text-gray-500 line-clamp-3">{item.desc}</p>
      </div>
    </Link>
  );
}

export default TemplateCard;
