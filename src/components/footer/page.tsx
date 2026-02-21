import {
  FiMapPin,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import {
  FaFacebookF,
  FaInstagram,
  FaRss,
  FaTwitter,
  FaPinterestP,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#2b2b2b] text-gray-300">
      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand & Contact */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8">
            F<span className="text-teal-400">R</span>EAK
          </h2>

          <div className="flex gap-4 mb-6">
            <div className="p-3 border border-gray-500 rounded-full">
              <FiMapPin />
            </div>
            <p className="text-sm leading-relaxed">
              House No 08, Road No 08,<br />
              Din Bari, Dhaka, Bangladesh
            </p>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="p-3 border border-gray-500 rounded-full">
              <FiMail />
            </div>
            <p className="text-sm">
              Username@gmail.com<br />
              Damo@gmail.com
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-3 border border-gray-500 rounded-full">
              <FiPhone />
            </div>
            <p className="text-sm">
              +660 256 24857<br />
              +660 256 24857
            </p>
          </div>
        </div>

        {/* Information */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-6">
            INFORMATION
          </h3>
          <ul className="space-y-4 text-sm">
            {[
              "Hot Sale",
              "best Seller",
              "Suppliers",
              "Our Store",
              "Deal of The Day",
            ].map((item) => (
              <li
                key={item}
                className="border-b border-gray-600 pb-3 hover:text-white cursor-pointer"
              >
                › {item}
              </li>
            ))}
          </ul>
        </div>

        {/* My Account */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-6">
            MY ACCOUNT
          </h3>
          <ul className="space-y-4 text-sm">
            {[
              "My Account",
              "Personal Information",
              "Discount",
              "Orders History",
              "Payment",
            ].map((item) => (
              <li
                key={item}
                className="border-b border-gray-600 pb-3 hover:text-white cursor-pointer"
              >
                › {item}
              </li>
            ))}
          </ul>
        </div>

        {/* About Us */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-6">
            ABOUT US
          </h3>
          <p className="text-sm leading-relaxed mb-6">
            Lorem ipsum dolor sit amet, consecteir our
            adipisicing elit, sed do eiusmod tempor the
            incididunt ut labore et dolore magnaa
            liqua. Ut enim minim.
          </p>

          <div className="flex gap-3">
            {[FaFacebookF, FaInstagram, FaRss, FaTwitter, FaPinterestP].map(
              (Icon, i) => (
                <div
                  key={i}
                  className="w-10 h-10 flex items-center justify-center border border-gray-500 rounded-full hover:bg-white hover:text-black transition cursor-pointer"
                >
                  <Icon size={14} />
                </div>
              )
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
