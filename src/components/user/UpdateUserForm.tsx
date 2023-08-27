import { Formik, Field, Form, ErrorMessage } from "formik";
import { updateUserSchema } from "../schemas/updateUser";
import type { ChangeEvent } from "react";
import { api } from "~/utils/api";
import { twMerge } from "tailwind-merge";
//TODO: Add client-side resize of profile image.

export interface UpdateUserStyle {
  label: string | undefined;
  field: string | undefined;
  errorMsg: string | undefined;
  button: string | undefined;
  container: string | undefined;
}

interface Values {
  username: string;
  profilePicture: string;
  profileDescription: string;
}

export const UpdateUserForm = ({
  styles,
  defaultValues,
  changeImg,
}: {
  styles: UpdateUserStyle;
  defaultValues: Values;
  changeImg?: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const context = api.useContext();

  const mutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      void context.user.fullInfo.invalidate();
      alert("Profile updated!");
    },
    onError: (error) => {
      alert(error);
    }
  });
  return (
    <div className={styles.container}>
      <Formik
        initialValues={{
          username: defaultValues.username,
          profilePicture: defaultValues.profilePicture,
          linkfield: defaultValues.profilePicture,
          profileDescription: defaultValues.profileDescription,
        }}
        validationSchema={updateUserSchema}
        onSubmit={(values) => {
          mutation.mutate({
            username: values.username,
            profilePicture: values.profilePicture,
            description: values.profileDescription,
          });
        }}
        validateOnChange={false}
      >
        {({ setFieldValue }) => (
          <Form>
            <div className="flex w-full flex-col">
              <div className="my-2">
                <div className="flex flex-row flex-wrap align-middle">
                  <label className={styles.label} htmlFor="username">
                    Username:
                  </label>
                  <Field
                    className={styles.field}
                    id="username"
                    name="username"
                  />
                </div>
                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="username"
                  />
                </div>
              </div>
              <div className="my-2">
                <div className="flex flex-row flex-wrap align-top">
                  <label className={styles.label} htmlFor="profileDescription">
                    Description:
                  </label>
                  <Field
                    className={styles.field}
                    component="textarea"
                    rows="4"
                    id="profileDescription"
                    name="profileDescription"
                  />
                </div>

                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="profileDescription"
                  />
                </div>
              </div>
              <div className="my-2">
                <div className="flex flex-row flex-wrap">
                  <label className={styles.label} htmlFor="profilePicture">
                    Profile picture (url or file):
                  </label>
                  <Field
                    className={styles.field}
                    id="linkfield"
                    name="linkfield"
                    onBlur={async (e: ChangeEvent<HTMLInputElement>) => {
                      await setFieldValue("profilePicture", e.target.value, true);
                    }}
                  />
                  <Field
                    className={twMerge("hidden", styles.field)}
                    id="profilePicture"
                    name="profilePicture"
                  />
                  <input
                    className="m-2"
                    type="file"
                    name="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const file = e.target.files[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onloadend = async () => {
                        await setFieldValue("profilePicture", reader.result, true);
                        if (changeImg && typeof reader.result == "string") {
                          changeImg(reader.result);
                        }
                      };
                    }}
                  />
                </div>
                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="profilePicture"
                  />
                </div>
              </div>
            </div>

            <div className="mt-2">
              <button type="submit" className={styles.button}>
                Update
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
