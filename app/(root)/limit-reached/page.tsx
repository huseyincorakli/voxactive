import { AlertCircle } from "lucide-react";
import Link from "next/link";
import Head from "next/head";

export default function LimitReached() {
  return (
    <>
        <div className="mx-auto max-w-md  bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Limit Reached</h1>
            <p className="mt-2 text-gray-600">
            You have reached your daily limit, please try again tomorrow.
            </p>
          </div>
          
          <div className="mt-6">
            <Link 
              href="/" 
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Homepage
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              If you need immediate assistance, please contact  me at <a href="mailto:huseyincorakli46@gmail.com" className="text-blue-600 hover:text-blue-500">huseyincorakli46@gmail.com</a>
            </p>
          </div>
        </div>
    </>
  );
}