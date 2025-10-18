export default function SiteFooter() {
  return (
    <footer>
      <div className="wrapper-fluid">
        <div className="footer-copyright">
          <p>
            © {new Date().getFullYear()} KWN - 대한복지뉴스. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
