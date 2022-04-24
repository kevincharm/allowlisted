/* This example requires Tailwind CSS v2.0+ */
import React, { useState } from "react";

import ConnectorModal from "@components/ConnectorModal";
import { useWeb3React } from "@web3-react/core";
import { Header } from "@components/Header";
import Link from "next/link";


export default function Example() {
  const { isActive, account } = useWeb3React()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <Header />

      <main className="lg:relative">
        <div className="mx-auto max-w-7xl w-full pt-16 pb-20 text-center lg:py-48 lg:text-left">
          <div className="px-4 lg:w-1/2 sm:px-8 xl:pr-16">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
              <span className="block xl:inline">Fairy mint</span>{' '}
              <span className="block text-lime-600 xl:inline">the fair allow list</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
              Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet
              fugiat veniam occaecat fugiat aliqua.
            </p>
            <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <a
                  href="/createRaffle"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-lime-400 bg-opacity-20 text-lime-900 hover:bg-opacity-30 md:py-4 md:text-lg md:px-10"
                >
                  Create raffle
                </a>
              </div>

            </div>
          </div>
        </div>
        <div className="relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full">
          <span style={{fontSize: "400px"}}>🧚</span>

        </div>
      </main>
      <ConnectorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        desiredChain={1}
      />
    </div>
  )
}
