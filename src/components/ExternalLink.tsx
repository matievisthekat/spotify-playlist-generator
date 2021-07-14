export default function ExternalLink(
  props: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>
) {
  return (
    <a {...props} className="link" target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}
