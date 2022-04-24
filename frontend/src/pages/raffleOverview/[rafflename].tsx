/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Header } from "@components/Header";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import Allowlister from "@abi/Allowlister.json";
import { useSignerOrProvider } from "@hooks/useWeb3React";
import LensHub from "@abi/LensHub.json";


export default function Example() {
  const { isActive, account } = useWeb3React()
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const signerOrProvider = useSignerOrProvider();
  const [raffleName, setRaffleName] = useState("Loading...");
  const [winnersToDraw, setWinnersToDraw] = useState(0);
  const [raffleReady, setRaffleReady] = useState(false);

  const image = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
  const [registeredUsers, setRegisteredUsers] = useState([
    {
      handle: '@alice',
      address: '0x7f268357a8c2552623316e2562d90e642bb538e5',
      image: image,
    },
    {
      handle: '@alice',
      address: '0x7f268357a8c2552623316e2562d90e642bb538e4',
      image: image,
    },
  ]);


  const onClose = () => setIsOpen(false);

  useEffect(() => {
    const address = router.query.rafflename
    if (!address || !signerOrProvider) {
      console.log(router.query);
      return;
    }
    console.log(`Got address ${address}!`);
    const contract = new ethers.Contract(address as string, Allowlister.abi, signerOrProvider);
    contract.displayName().then((x) => setRaffleName(x));
    contract.winnersToDraw().then((x) => setWinnersToDraw(x.toNumber()));
    contract.s_randomState().then((x) => setRaffleReady(!x.eq(0)));
    const lensHub = new ethers.Contract(	"0x4BF0c7AD32Fd2d32089790a54485e23f5C7736C0", LensHub.abi, signerOrProvider);
    console.log(contract);
    let users = [];
    contract.getRegisteredIdsLength().then((l) => {
      for (let i = 0; i < l; i++) {
        contract.s_registeredIds(i).then((id) => {
          contract.s_registeredAddresses(id).then((address) => {
            lensHub.getHandle(id).then((handle: string) => {
              users.push({handle, address: address, image: image});
              setRegisteredUsers(users);
            });
          })
        })
      }
    });
  }, [router.query.rafflename, signerOrProvider])

  const handleRandomState = useCallback(async (event) => {
    console.log(`Handling!`);
    event.preventDefault();
    const address = router.query.rafflename
    if (!address || !signerOrProvider) {
      return
    }
    setCreating(true);
    try {
      const contract = new ethers.Contract(address as string, Allowlister.abi, signerOrProvider);
      console.log(contract);
      await contract.requestRandomNumber();
      setIsOpen(true);
    } catch (e) {
      console.log(e);
    } finally {
      setCreating(false);
    }
  }, [router.query.rafflename, signerOrProvider]);

  const handleSubmit = useCallback(async (event) => {
    console.log(`Handling!`);
    event.preventDefault();
    const address = router.query.rafflename
    if (!address || !signerOrProvider) {
      return
    }
    setCreating(true);
    try {
      const contract = new ethers.Contract(address as string, Allowlister.abi, signerOrProvider);
      console.log(contract);
      await contract.raffle();
      setIsOpen(true);
    } catch (e) {
      console.log(e);
    } finally {
      setCreating(false);
    }
  }, [router.query.rafflename, signerOrProvider]);


  return (
    <div>
      <Header />
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Raffle: {raffleName}
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
                                disabled
                                value={raffleName}
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
                                disabled
                                value={winnersToDraw}
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
                                disabled
                                value={10}
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
                                disabled
                                value={1}
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
                                value={"2022-04-20"}
                                disabled
                                id="following_since"
                                autoComplete="address-level1"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="px-4 sm:px-6 lg:px-8">
                        <div className="sm:flex sm:items-center">
                          <div className="sm:flex-auto">
                            <h1 className="text-xl font-semibold text-gray-900">Registered users</h1>
                          </div>
                        </div>

                        </div>
                        <div className="mt-8 flex flex-col">
                          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                  <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                      Name
                                    </th>

                                  </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 bg-white">
                                  {registeredUsers.map((person) => (
                                    <tr key={person.address}>
                                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                        <div className="flex items-center">
                                          <div className="h-10 w-10 flex-shrink-0">
                                            <img className="h-10 w-10 rounded-full" src={person.image} alt="" />
                                          </div>
                                          <div className="ml-4">
                                            <div className="font-medium text-gray-900">{person.handle}</div>
                                            <div className="text-gray-500">{person.address}</div>
                                          </div>
                                        </div>
                                      </td>

                                    </tr>
                                  ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>



                        <div className="px-4 py-3 bg-gray-50 text-center sm:px-6">
                          {!raffleReady &&

                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-lime-400 bg-opacity-20 text-lime-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Roll dice!
                          </button>
                          }
                          {(!raffleReady && isCreating) &&


                          <button type="button" disabled className="bg-indigo-500 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">

                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Rolling...
                          </button>
                          }
                          {(raffleReady && !isCreating) &&

                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-lime-400 bg-opacity-20 text-lime-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Start raffle
                          </button>
                          }
                          {(raffleReady && isCreating) &&


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
                  Raffle startd!
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
