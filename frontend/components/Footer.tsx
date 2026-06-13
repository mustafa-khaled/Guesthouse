export default function Footer() {
  return (
    <footer className="px-8 py-12 mt-auto text-white bg-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-6">
          <span className="text-3xl font-bold text-green-400">Guesthouse</span>
        </div>
        <ul className="flex justify-center gap-6 mb-6 text-sm">
          <li>
            <a href="#" className="hover:text-green-400">
              About us
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-green-400">
              Download apps
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-green-400">
              Become a guide
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-green-400">
              Careers
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-green-400">
              Contact
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500">
          &copy; by Jonas Schmedtmann. Feel free to use this project for your
          own purposes, EXCEPT producing your own course or tutorials!
        </p>
      </div>
    </footer>
  )
}
