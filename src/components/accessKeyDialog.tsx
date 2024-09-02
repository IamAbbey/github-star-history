"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,FormDescription,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useChartStore } from "@/lib/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckIcon } from "@radix-ui/react-icons";
import { useToast } from "./ui/use-toast";

const AccessKeyInputFormSchema = z.object({
  accessKey: z.string().min(2, {
    message: "Repository name must be at least 2 characters.",
  }),
});

export function AccessKeyDialog() {
    const { toast } = useToast()
  const openAccessKeyDialog = useChartStore(
    (state) => state.openAccessKeyDialog
  );
  const setOpenAccessKeyDialog = useChartStore(
    (state) => state.setOpenAccessKeyDialog
  );
  const setAccessKey = useChartStore((state) => state.setAccessKey);

  const form = useForm<z.infer<typeof AccessKeyInputFormSchema>>({
    resolver: zodResolver(AccessKeyInputFormSchema),
    defaultValues: {
      accessKey: "",
    },
  });
  function onSubmit(data: z.infer<typeof AccessKeyInputFormSchema>) {
    setAccessKey(data.accessKey);

    toast({
      title: "Success",
      description: "Access key added successfully.",
      variant: "default"
    })

    form.reset()
  }
  return (
    <Dialog
      open={openAccessKeyDialog}
      onOpenChange={(open) => setOpenAccessKeyDialog(open)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add GitHub Access Token</DialogTitle>
          <DialogDescription>
            <span className="py-3">
              Star-history uses the GitHub API to retrieve repository metadata.
              You may see this page because you have hit the GitHub API rate
              limit.{" "}
            </span> <br /><br />

            <span>
              Star-history will need your personal access token to unlimit it.
              If you don't already have one, create one, and paste it into the
              textbox below (no scope to your personal data is needed).
            </span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex align-top space-x-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid flex-1 gap-2">
            <Label htmlFor="accessKey" className="sr-only">
              Access Token
            </Label>
              <FormField
                control={form.control}
                name="accessKey"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter access token"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Access Token (will be stored in your local storage).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" size="sm" className="px-3 mt-0.5">
              <span className="sr-only">Submit</span>
              <CheckIcon className="h-4 w-4" />
            </Button>
          </form>
        </Form>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
