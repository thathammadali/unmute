import './globals.css';

import {Metadata} from "next";
import React from "react";

const metadata: Metadata = {
    title: "Unmute"
}

export {metadata}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
