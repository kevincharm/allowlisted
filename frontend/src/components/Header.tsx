import { useWeb3React } from "@web3-react/core";
import React, { useState } from "react";
import { Popover } from "@headlessui/react";
import { MenuIcon } from "@heroicons/react/outline";
import { metaMask } from "@connectors/metaMask";
import { getAddChainParameters } from "@chains";
import { getHandle } from "@utils/Utils";

export function Header() {
  const { isActive, account } = useWeb3React();
  const [isOpen, setIsOpen] = useState(false);
  const [handle, setHandle] = useState("");

  getHandle().then((h) => setHandle(h));

  return (
    <div>
      <Popover className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <a href="/">
                <span className="sr-only">Workflow</span>
                🧚
              </a>
            </div>
            <div className="-mr-2 -my-2 md:hidden">
              <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                <span className="sr-only">Open menu</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </Popover.Button>
            </div>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">

              { !isActive &&
              <button
                type="button"
                onClick={() => metaMask.activate(getAddChainParameters(80001))}
                className="bg-lime-400 text-lime-900 rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
              >
                Connect with Lens
              </button>
              }

              { isActive &&
                <div>
                  <span>@{handle}</span>
                  <button
                    type="button"
                    style={{display: "inline"}}
                    onClick={() => {
                      metaMask.deactivate()
                    }}
                    className="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                  >
                    Disconnect
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

      </Popover>
    </div>
  )
}
