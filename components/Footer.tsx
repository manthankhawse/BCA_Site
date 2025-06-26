export default function Footer() {
  return (
    <footer className="bg-[#333] text-white py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        {/* Left Info */}
        <div className="max-w-xl space-y-3">
          <h3 className="text-xl font-semibold">Brilliant Chess Academy</h3>
          <p>
            <strong>Address:</strong> B-73, near J.P English School, Ramana Maruti Nagar, Nandanvan, Nagpur, Maharashtra 440024
          </p>
          <p>
            <strong>Phone:</strong> 9028456007 (Whatsapp), 8830924866
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:brilliantchessacademy007@gmail.com" className="text-white hover:underline">
              brilliantchessacademy007@gmail.com
            </a>
          </p>
        </div>

        {/* Map */}
        <div className="w-full md:w-[400px] h-[250px]">
          <iframe
            className="w-full h-full rounded-md border-0"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.6885748792415!2d79.1269295753791!3d21.124978580548564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4c73b8d57fde3%3A0xed371d0ce2414043!2sBrilliant%20Chess%20Academy!5e0!3m2!1sen!2sin!4v1718729601143!5m2!1sen!2sin"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </footer>
  );
}
