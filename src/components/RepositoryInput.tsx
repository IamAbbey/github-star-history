"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChartStore } from "@/lib/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const RepositoryInputFormSchema = z.object({
  repository: z.string().min(2, {
    message: "Repository name must be at least 2 characters.",
  }),
});

export function RepositoryInputForm() {
  const form = useForm<z.infer<typeof RepositoryInputFormSchema>>({
    resolver: zodResolver(RepositoryInputFormSchema),
    defaultValues: {
      repository: "",
    },
  });

  const addRepository = useChartStore((state) => state.addRepository)

  function onSubmit(data: z.infer<typeof RepositoryInputFormSchema>) {
    addRepository(data.repository);

    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="repository"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Enter repository name, you can enter more than one after pressing enter"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="hidden">
          Submit
        </Button>
      </form>
    </Form>
  );
}
