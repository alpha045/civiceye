import { imageHash } from "image-hash";

export const generateImageHash =
  (imagePath) => {

    return new Promise(
      (resolve, reject) => {

        imageHash(
          imagePath,
          16,
          true,

          (error, hash) => {

            if (error) {

              reject(error);

            } else {

              resolve(hash);
            }
          }
        );
      }
    );
  };