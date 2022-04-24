/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment, useLayoutEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Header } from "@components/Header";
import { Dialog, Transition } from "@headlessui/react";
import { createRaffle, FACTORY_CONTRACT, getHandle } from "@utils/Utils";
import { useSignerOrProvider } from "@hooks/useWeb3React";
import { BigNumber, ethers } from "ethers";
import AllowlisterFactory from "@abi/AllowlisterFactory.json";

export default function Example() {
  const { isActive, account } = useWeb3React()
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [raffleAddress, setRaffleAddress] = useState(null);
  const [url, setUrl] = useState("localhost:3000");

  useLayoutEffect(() => {
    setUrl(window.location.protocol + '//' + window.location.host);
    console.log("URL" + url);
  });
  const onClose = () => setIsOpen(false);
  const signerOrProvider = useSignerOrProvider();

  let handle = "";
  getHandle().then((h) => handle = h);

  const handleSubmit = async (event) => {
    console.log(`Handling!`);
    event.preventDefault();
    setCreating(true);
    try {
      const contract = new ethers.Contract(	FACTORY_CONTRACT, AllowlisterFactory.abi, signerOrProvider);
      const raffleId = BigNumber.from(await contract.s_raffleId());
      const result = await contract.createRaffle(
        handle, event.target.raffle_name.value, event.target.number_of_spots.value, ethers.constants.AddressZero, ethers.constants.AddressZero
      );
      await result.wait();
      setRaffleAddress(await contract.raffles(raffleId));
      setIsOpen(true);
    } catch (e) {
      console.log(e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <Header />
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Create new raffle
            </p>
          </div>

          <div className="mt-10">

              <div className="mt-10 sm:mt-0">
                <div className="md:grid md:gap-6">

                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <form onSubmit={handleSubmit}>
                      <div className="shadow overflow-hidden sm:rounded-md">
                        <div className="px-4 py-5 bg-white sm:p-6">
                          <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="raffle_name" className="block text-sm font-medium text-gray-700">
                                Raffle name
                              </label>
                              <input
                                type="text"
                                required
                                name="raffle_name"
                                id="raffle_name"
                                autoComplete="given-name"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="number_of_spots" className="block text-sm font-medium text-gray-700">
                                Number of spots
                              </label>
                              <input
                                type="number"
                                name="number_of_spots"
                                required
                                id="number_of_spots"
                                autoComplete="email"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>

                            <div className="col-span-6">
                              <legend className="text-base font-medium text-gray-900">Profile requirements</legend>
                            </div>

                            <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                              <label htmlFor="amount_of_followers" className="block text-sm font-medium text-gray-700">
                                Amount of followers
                              </label>
                              <input
                                type="number"
                                required
                                name="amount_of_followers"
                                id="amount_of_followers"
                                autoComplete="street-address"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>

                            <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                              <label htmlFor="amount_of_publications" className="block text-sm font-medium text-gray-700">
                                Amount of publications
                              </label>
                              <input
                                type="number"
                                required
                                name="amount_of_publications"
                                id="amount_of_publications"
                                autoComplete="address-level2"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>

                            <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                              <label htmlFor="following_since" className="block text-sm font-medium text-gray-700">
                                Following since
                              </label>
                              <input
                                type="date"
                                name="following_since"
                                required
                                id="following_since"
                                autoComplete="address-level1"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>

                          </div>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 text-center sm:px-6">
                          {!isCreating &&

                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md bg-lime-400 bg-opacity-20 text-lime-900 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Create
                          </button>
                          }
                          {isCreating &&


                          <button type="button" disabled className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md bg-lime-400 bg-opacity-20 text-lime-900 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">

                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </button>
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
                  Success!
                </Dialog.Title>

                <div className="mt-8 space-y-2">
                  Here is your raffle URL: <a href={"/raffle/" + raffleAddress}>{url}/raffle/{raffleAddress}</a>
                </div>

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
