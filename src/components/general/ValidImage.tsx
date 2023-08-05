import { env } from "~/env.mjs";
import { isImgUrl } from "~/utils/image";
import { useEffect, useState } from "react";

const ValidImage = ({
  src,
  alt,
  className,
}: {
  src: string | undefined | null;
  alt?: string;
  className?: string;
}) => {
  const [imageUrl, setimageUrl] = useState(env.NEXT_PUBLIC_DEFAULT_IMAGE);

  useEffect(() => {
    const fetchImg = async () => {
      if (src) {
        const isValid = await isImgUrl(src);
        if (isValid) {
          setimageUrl(src);
        } else {
          console.log("Invalid image url:", src);
        }
      }
    };
    fetchImg();
  }, [src]);

  return <img className={`${className}`} src={imageUrl} alt={alt} />;
};

export default ValidImage;
