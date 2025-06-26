export default function Gallery() {
  const images = [
    "IMG-20240617-WA0017.jpg",
    "IMG-20240617-WA0018.jpg",
    "IMG-20240617-WA0022.jpg",
    "IMG-20240617-WA0023.jpg",
    "IMG-20240617-WA0024.jpg",
    "IMG-20240617-WA0025.jpg",
    "IMG-20240617-WA0026.jpg",
    "IMG-20240617-WA0027.jpg",
    "IMG-20240617-WA0028.jpg",
    "IMG-20240617-WA0029.jpg",
    "IMG-20240617-WA0030.jpg",
    "IMG-20240617-WA0031.jpg",
  ];

  return (
    <section id="gallery" className="py-16">
      <h2 className="text-3xl font-bold text-center mb-10">Achievements</h2>

      <div className="grid gap-4 px-4 sm:px-6 md:px-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
        {images.map((img, index) => (
          <a
            key={index}
            href={`/assets/gallery/${img}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
          >
            <img
              src={`/assets/gallery/${img}`}
              alt={`gallery${index + 1}`}
              className="w-full h-60 object-cover"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
