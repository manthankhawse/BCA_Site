export default function Tournaments() {
  return (
    <>
      {/* Tournaments Header Section */}
      <section className="flex flex-col items-center gap-4 my-16 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">
          BCA&apos;s Upcoming Tournaments
        </h2>
        <div className="h-[3px] w-16 bg-gray-600" />
      </section>

      {/* Divider Line */}
      <div className="h-[3px] w-[80%] mx-auto my-32 bg-gray-400" />
    </>
  );
}
