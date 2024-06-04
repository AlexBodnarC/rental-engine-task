"use client";

import Link from "next/link";
import Container from "./_components/ui/Container";
import useDataWithStatus from "./_hooks/useDataWithStatus";
import LinkSvg from "./_components/svg/Link";
import Image from "next/image";

export default function HomePage() {
  const {
    dataWithStatus,
    zillowError,
    zumperError,
    zillowIsLoading,
    zumperIsLoading,
  } = useDataWithStatus();

  console.log(dataWithStatus);

  if (zillowIsLoading || zumperIsLoading) {
    return <h1>Loading...</h1>;
  }

  if (zillowError || zumperError) {
    return <h1>Please retry later</h1>;
  }

  return (
    <>
      {dataWithStatus?.map((item) => (
        <Container key={item.id} minWidth="15rem" minHeight="5rem">
          <div className="flex flex-col items-start justify-center gap-2 p-1 ">
            <Image
              className="h-[400px] w-[300px] object-cover"
              src={
                item.zillowItem?.ListingPhoto
                  ? item.zillowItem?.ListingPhoto[0]?._attributes.source ??
                    "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"
                  : "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"
              }
              width={300}
              height={400}
              alt="image"
            />
            <p>State: {item.state_name}</p>
            <p>City: {item.city_name}</p>

            <p>Street: {item.street_name}</p>
            <p>Pets: {item.pets_allowed}</p>

            <Link
              target="_blank"
              href={`https://rentengine.io/listings/${item.id}`}
              className="flex items-center justify-start gap-2"
            >
              RentEngine <LinkSvg />
            </Link>
            <p>
              {item?.zillowItem ? "Exist on Zillow" : "don't exist on Zillow"}
            </p>
            <Link
              target="_blank"
              className="flex items-center justify-start gap-2"
              href={`https://www.zumper.com/backlinks/rent_engine/${item.id}`}
            >
              {item?.zumperItem ? "Exist on Zumper" : "don't exist on Zumper"}{" "}
              <LinkSvg />
            </Link>
          </div>
        </Container>
      ))}
    </>
  );
}
