/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Header } from "@components/Header";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { useSignerOrProvider } from "@hooks/useWeb3React";
import { BigNumber, ethers } from "ethers";
import Allowlister from "@abi/Allowlister.json";


export default function Example() {
  const router = useRouter();
  const { isActive, account } = useWeb3React()
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [isRegistered, setRegistered] = useState(false);
  const [raffleName, setRaffleName] = useState("Loading...");
  const [winnersToDraw, setWinnersToDraw] = useState(0);
  const onClose = () => setIsOpen(false)
  const signerOrProvider = useSignerOrProvider();

  useEffect(() => {
    const address = router.query.address
    if(!address || !signerOrProvider) return;
    const contract = new ethers.Contract(address as string, Allowlister.abi, signerOrProvider);
    (async () => {
      await contract.deployed()
      const displayName = await contract.displayName()
      setRaffleName(displayName)
    })()
    // contract.winnersToDraw().then((x) => setWinnersToDraw(x.toNumber()));
  }, [router.query.address])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    const address = router.query.address
    if (!address || !signerOrProvider) {
      return
    }
    setCreating(true);
    try {
      const contract = new ethers.Contract(address as string, Allowlister.abi, signerOrProvider);
      console.log(contract);
      await contract.connect(signerOrProvider).register();
      // await contract.register();
      setIsOpen(true);
    } catch (e) {
      console.log(e);
    } finally {
      setCreating(false);
      setRegistered(true);
    }
  }, [router.query.address, signerOrProvider])


  return (
    <div>
      <Header />
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Raffle: {raffleName}
            </p>
            <p>Number of spots: {winnersToDraw}</p>
          </div>

          <div className="mt-10">

            <div className="mt-10 sm:mt-0">
              <div className="md:grid md:gap-6">
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <form onSubmit={handleSubmit}>
                    <div className="shadow overflow-hidden sm:rounded-md">
                      <div className="px-4 py-5 bg-white sm:p-6">
                        <div className="mt-5 md:mt-0 md:col-span-2">
                          <legend className="text-base font-bold text-gray-900">Profile requirements</legend>
                        </div>
                        <div className="w-1/3 ml-16 bg-white rounded-lg shadow">
                          <ul className="divide-y-2 divide-gray-100">
                            <li className="p-3">Number of followers: 10</li>
                            <li className="p-3">Number of publications: 1</li>
                            <li className="p-3">Following since: 15/04/2022</li>
                          </ul>
                        </div>

                        {!isRegistered &&

                        <div className="px-4 py-3 bg-gray-100 text-center sm:px-6">
                          {!isCreating &&

                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Register for raffle
                          </button>
                          }
                          {isCreating &&
                          <button type="button" disabled className="bg-indigo-500 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">

                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </button>
                          }
                        </div>
                        }

                        {isRegistered &&
                        <div className="px-4 py-3 bg-gray-100 text-center sm:px-6">
                          <span

                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            You're registered!
                          </span>
                        </div>
                        }

                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={onClose}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-70" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
            &#8203;
          </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Registered!
                </Dialog.Title>

                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-800 transition hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
