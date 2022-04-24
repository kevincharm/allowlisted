/* This example requires Tailwind CSS v2.0+ */
import { useEffect, useState } from "react";

import ConnectorModal from "@components/ConnectorModal";
import { useWeb3React } from "@web3-react/core";
import { Header } from "@components/Header";
import { ethers } from "ethers";
import AllowlisterFactory from "@abi/AllowlisterFactory.json";
import Allowlister from "@abi/Allowlister.json";
import { useRouter } from "next/router";
import { useSignerOrProvider } from "@hooks/useWeb3React";
import { FACTORY_CONTRACT } from "@utils/Utils";


export default function Example() {
  const { isActive, account } = useWeb3React()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter();
  const signerOrProvider = useSignerOrProvider();
  const image = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

  const [raffles, setRaffles] = useState([
    {
      name: 'Moonbirds',
      image: image,
      address: "a"
    },
    {
      name: 'Raffle 2',
      image: image,
      address: "b"
    }
  ]);

  useEffect(() => {
    if(!signerOrProvider) return;
    const contract = new ethers.Contract(FACTORY_CONTRACT, AllowlisterFactory.abi, signerOrProvider);
    let raffles = [];
    contract.s_raffleId().then((maxId) => {
      for (let i = 0; i < maxId; i++) {
        contract.raffles(i).then((allowLister) => {
          console.log(`AllowLister`, allowLister);
          const currentContract = new ethers.Contract(allowLister, Allowlister.abi, signerOrProvider);
          currentContract.displayName().then((name) => {
            console.log(`Got ${name}`)
            raffles.push({name, image, address: allowLister})
            setRaffles(raffles);
          });
        })
      }
    });

  }, [signerOrProvider])



  return (
    <div>
      <Header />
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Your raffles
            </p>

          </div>

          <div className="px-4 sm:px-6 lg:px-8">

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


                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Role
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                      {raffles.map((person) => (
                        <tr key={person.name}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img className="h-10 w-10 rounded-full" src={person.image} alt="" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{person.name}</div>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          Active
                        </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href={"raffle/" + person.address} className="text-indigo-600 hover:text-indigo-900">
                              View<span className="sr-only">, {person.name}</span>
                            </a>
                            <a href={"raffleOverview/" + person.address} className="text-indigo-600 hover:text-indigo-900">
                              Edit<span className="sr-only">, {person.name}</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <ConnectorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        desiredChain={1}
      />
    </div>
  )
}
