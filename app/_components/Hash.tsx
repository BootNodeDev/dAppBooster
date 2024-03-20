import { truncateStringInTheMiddle } from "@/app/_utils/strings";
import { Copy } from "@/app/_components/assets/Copy";
import { Link } from "@/app/_components/assets/Link";
import { ChainKeys } from "@/app/_lib/wagmi.config";
import { getExplorerUrl } from "@/app/_utils/getExplorerUrl";

interface Props {
  chainId: ChainKeys;
  address: string;
  showExternalLink?: boolean;
  showCopyButton?: boolean;
  onCopy?: () => void;
}

// TODO: add toast when the user clicks the button.
// perhaps we can use an animation to replace the toast.

export const Hash: React.FC<Props> = ({
  chainId,
  address,
  showCopyButton = true,
  showExternalLink = true,
  onCopy,
  ...restProps
}) => {
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    onCopy && onCopy();
  };

  const explorerUrl = getExplorerUrl(chainId, address);

  return (
    <div {...restProps} style={{ color: "white" }}>
      <a href={explorerUrl}>{truncateStringInTheMiddle(address, 8, 6)}</a>
      {showCopyButton && (
        <button
          onClick={() => copyAddress(address)}
          style={{ backgroundColor: "white", color: "red" }}
        >
          <Copy />
          Copy
        </button>
      )}
      {showExternalLink && (
        <a
          href={explorerUrl}
          style={{ backgroundColor: "white", color: "red" }}
        >
          <Link />
          link
        </a>
      )}
    </div>
  );
};
