import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion"; 

export function Card({ children, className, ...props }) {
    return (
        <motion.div
            {...props}
            className={clsx(
                // Cleaner, modern styles: bg-white, rounded-xl, light border
                "bg-white rounded-xl p-5 border border-gray-200 transition duration-300",
                className
            )}
        >
            {children}
        </motion.div>
    );
}