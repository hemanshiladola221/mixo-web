import React from "react";
import clsx from "clsx";


export function Card({ children, className, ...props }) {
    return (
        <div
            {...props}
            className={clsx(
                "bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition",
                className
            )}
        >
            {children}
        </div>
    );
}