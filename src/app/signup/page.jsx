"use client";

import Image from "next/image";
import Link from "next/link";
import SignupForm from "./components/SignupForm";
const SignUpPage = () => {
 return (
    <div className="container px-24 mx-auto py-24">
      <div className="grid grid-cols-2 gap-12 items-center">
        <div>
          <Image
            src="/assets/images/login/login.svg"
            height="540"
            width="540"
            alt="login image"
          />
        </div>

        {/* right side */}
        <SignupForm/>
      </div>
    </div>
  );
}


export default SignUpPage;
