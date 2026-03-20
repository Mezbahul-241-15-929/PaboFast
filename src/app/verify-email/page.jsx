"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) return;

            try {
                const res = await fetch(`/api/auth/verify?token=${token}`);
                const data = await res.json();

                console.log(data);
            } catch (err) {
                console.log("Verification failed");
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div>
            <h1>Verifying your email...</h1>
        </div>
    );
}