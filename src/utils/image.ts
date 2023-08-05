import { env } from "~/env.mjs";
// import Resizer from "react-image-file-resizer";

export const isImgUrl = async (url: string) => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.headers == null) return false;
    const type = res.headers.get("Content-Type");
    if (type == null) return false;
    return type.startsWith("image");
  } catch (error) {
    return false;
  }
};

export const resizeWrapper = (
  imgSrc: string,
  maxW: number,
  maxH: number,
  square: boolean
) => {
  const result = resizeImg(imgSrc, maxW, maxH, square);
  if (result === env.NEXT_PUBLIC_DEFAULT_IMAGE) {
    alert("There was an error resizing image. Setting default image.");
  }
  return result;
};

export const resizeImg = (
  imgSrc: string,
  maxW: number,
  maxH: number,
  square: boolean
) => {
  if (
    window.File &&
    window.FileReader &&
    window.FileList &&
    window.Blob &&
    imgSrc
  ) {
    const img = new Image();
    img.src = imgSrc;
    console.log(imgSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return env.NEXT_PUBLIC_DEFAULT_IMAGE;

    let width = maxW;
    let height = maxW;

    // if (square) {
    //   const newSize = Math.min(maxW, Math.min(img.width, img.height));
    //   width = newSize;
    //   height = newSize;
    // } else {
    //   if (width > height) {
    //     if (width > maxW) {
    //       height *= maxW / width;
    //       width = maxW;
    //     }
    //   } else {
    //     if (height > maxH) {
    //       width *= maxH / height;
    //       height = maxH;
    //     }
    //   }
    // }

    console.log("w, h:", width, height);
    console.log("maxW, maxH:", maxW, maxH);
    console.log("img.width, img.height:", img.width, img.height);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    console.log(canvas);
    const dataurl = canvas.toDataURL("image/jpg");

    return dataurl;
  }

  return env.NEXT_PUBLIC_DEFAULT_IMAGE;
};

// export const getResizedImg = async (
//   img: string,
//   newWidth: number,
//   newHeight: number,
//   fileType: string
// ) => {
//   console.log(fileType)
//   const blob = new Blob([img], {type:fileType});
//   console.log(blob);
//   const image = await resizeFile(blob);
//   console.log("Image:",image);
//   return image as string;
// };

// const resizeFile = (file: Blob) =>
//   new Promise((resolve) => {
//     Resizer.imageFileResizer(
//       file,
//       300,
//       300,
//       "JPEG",
//       100,
//       0,
//       (uri) => {
//         resolve(uri);
//       },
//       "base64"
//     );
//   });

// function ResizeImage() {
//     if (window.File && window.FileReader && window.FileList && window.Blob) {
//         var filesToUploads = document.getElementById('imageFile').files;
//         var file = filesToUploads[0];
//         if (file) {

//             var reader = new FileReader();
//             // Set the image once loaded into file reader
//             reader.onload = function(e) {

//                 var img = document.createElement("img");
//                 img.src = e.target.result;

//                 var canvas = document.createElement("canvas");
//                 var ctx = canvas.getContext("2d");
//                 ctx.drawImage(img, 0, 0);

//                 var MAX_WIDTH = 400;
//                 var MAX_HEIGHT = 400;
//                 var width = img.width;
//                 var height = img.height;

//                 if (width > height) {
//                     if (width > MAX_WIDTH) {
//                         height *= MAX_WIDTH / width;
//                         width = MAX_WIDTH;
//                     }
//                 } else {
//                     if (height > MAX_HEIGHT) {
//                         width *= MAX_HEIGHT / height;
//                         height = MAX_HEIGHT;
//                     }
//                 }
//                 canvas.width = width;
//                 canvas.height = height;
//                 var ctx = canvas.getContext("2d");
//                 ctx.drawImage(img, 0, 0, width, height);

//                 dataurl = canvas.toDataURL(file.type);
//                 document.getElementById('output').src = dataurl;
//             }
//             reader.readAsDataURL(file);

//         }

//     } else {
//         alert('The File APIs are not fully supported in this browser.');
//     }
// }
