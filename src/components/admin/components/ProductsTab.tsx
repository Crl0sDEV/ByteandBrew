"use client"

import { useState, useEffect } from "react"
import {
  PlusCircle,
  Pencil,
  Trash2,
  ImageIcon,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
} from "lucide-react"
import { toast } from "sonner"


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


import { ProductForm } from "./ProductForm"


import type { Product } from "../types"

interface ProductsTabProps {
  products: Product[]
  loading: boolean
  onCreate: (product: Omit<Product, "id" | "created_at">) => Promise<void>
  onUpdate: (id: string, updates: Partial<Product>) => Promise<void>
  onDelete: (id: string, image_url: string | null) => Promise<void>
  uploadProductImage: (file: File) => Promise<string>
  deleteProductImage: (url: string) => Promise<void>
}

export function ProductsTab({
  products,
  loading,
  onCreate,
  onUpdate,
  onDelete,
  uploadProductImage,
  deleteProductImage,
}: ProductsTabProps) {
  
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "name",
    "image",
    "category",
    "price",
    "points",
    "sizes",
    "temperature",
    "type",
    "status",
    "actions",
  ])
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product | null
    direction: "ascending" | "descending"
  }>({ key: null, direction: "ascending" })

  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; image_url: string | null } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  
  const itemsPerPage = 10

  
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  
  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig.key) return 0

    
    const aValue = a[sortConfig.key] ?? null
    const bValue = b[sortConfig.key] ?? null

    if (aValue === bValue) return 0

    const direction = sortConfig.direction === "ascending" ? 1 : -1

    
    if (aValue === null || aValue === undefined) return 1 * direction
    if (bValue === null || bValue === undefined) return -1 * direction

    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * direction
    }

    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * direction
    }

    
    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      return (aValue === bValue ? 0 : aValue ? -1 : 1) * direction
    }

    
    return (aValue < bValue ? -1 : 1) * direction
  })

  
  const filteredProducts = sortedProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)

  
  const requestSort = (key: keyof Product) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  
  const toggleColumn = (column: string) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter((col) => col !== column))
    } else {
      setVisibleColumns([...visibleColumns, column])
    }
  }

  
  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      setEditingProduct(null)
    }
  }

  
  const handleDeleteClick = (product: Product) => {
    setProductToDelete({ id: product.id, image_url: product.image_url })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    try {
      await onDelete(productToDelete.id, productToDelete.image_url)
      toast.success("Product deleted successfully")
    } catch (error) {
      toast.error("Failed to delete product")
      console.error("Error deleting product:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Manage your cafe products and menu items</CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setIsFormOpen(true)
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.includes("name")}
                  onCheckedChange={() => toggleColumn("name")}
                  disabled={true} 
                >
                  Name
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.includes("image")}
                  onCheckedChange={() => toggleColumn("image")}
                >
                  Image
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.includes("category")}
                  onCheckedChange={() => toggleColumn("category")}
                >
                  Category
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.includes("price")}
                  onCheckedChange={() => toggleColumn("price")}
                >
                  Price
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.includes("points")}
                  onCheckedChange={() => toggleColumn("points")}
                >
                  Points
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.includes("sizes")}
                  onCheckedChange={() => toggleColumn("sizes")}
                >
                  Sizes
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.includes("temperature")}
                  onCheckedChange={() => toggleColumn("temperature")}
                >
                  Temperature
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.includes("type")}
                  onCheckedChange={() => toggleColumn("type")}
                >
                  Type
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.includes("status")}
                  onCheckedChange={() => toggleColumn("status")}
                >
                  Status
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => requestSort("name")}>
                  Name{" "}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ))}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestSort("category")}>
                  Category{" "}
                  {sortConfig.key === "category" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ))}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestSort("base_price")}>
                  Price{" "}
                  {sortConfig.key === "base_price" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ))}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestSort("points_value")}>
                  Points{" "}
                  {sortConfig.key === "points_value" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ))}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Products Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes("name") && (
                    <TableHead className="cursor-pointer" onClick={() => requestSort("name")}>
                      Name{" "}
                      {sortConfig.key === "name" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="inline h-4 w-4" />
                        ) : (
                          <ChevronDown className="inline h-4 w-4" />
                        ))}
                    </TableHead>
                  )}
                  {visibleColumns.includes("image") && <TableHead>Image</TableHead>}
                  {visibleColumns.includes("category") && (
                    <TableHead className="cursor-pointer" onClick={() => requestSort("category")}>
                      Category{" "}
                      {sortConfig.key === "category" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="inline h-4 w-4" />
                        ) : (
                          <ChevronDown className="inline h-4 w-4" />
                        ))}
                    </TableHead>
                  )}
                  {visibleColumns.includes("price") && (
                    <TableHead className="cursor-pointer" onClick={() => requestSort("base_price")}>
                      Price{" "}
                      {sortConfig.key === "base_price" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="inline h-4 w-4" />
                        ) : (
                          <ChevronDown className="inline h-4 w-4" />
                        ))}
                    </TableHead>
                  )}
                  {visibleColumns.includes("points") && (
                    <TableHead className="cursor-pointer" onClick={() => requestSort("points_value")}>
                      Points{" "}
                      {sortConfig.key === "points_value" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="inline h-4 w-4" />
                        ) : (
                          <ChevronDown className="inline h-4 w-4" />
                        ))}
                    </TableHead>
                  )}
                  {visibleColumns.includes("sizes") && <TableHead>Sizes</TableHead>}
                  {visibleColumns.includes("temperature") && <TableHead>Temperature</TableHead>}
                  {visibleColumns.includes("type") && <TableHead>Type</TableHead>}
                  {visibleColumns.includes("status") && <TableHead>Status</TableHead>}
                  {visibleColumns.includes("actions") && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((product) => (
                    <TableRow key={product.id}>
                      {visibleColumns.includes("name") && <TableCell className="font-medium">{product.name}</TableCell>}
                      {visibleColumns.includes("image") && (
                        <TableCell>
                          {product.image_url ? (
                            <img
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.includes("category") && (
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes("price") && <TableCell>₱{product.base_price.toFixed(2)}</TableCell>}
                      {visibleColumns.includes("points") && <TableCell>{product.points_value}</TableCell>}
                      {visibleColumns.includes("sizes") && (
                        <TableCell>
                          {product.has_sizes ? (
                            <div className="flex flex-wrap gap-1">
                              {product.sizes?.map((size) => (
                                <Badge key={size} variant="secondary">
                                  {size}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.includes("temperature") && <TableCell>{product.temperature}</TableCell>}
                      {visibleColumns.includes("type") && (
                        <TableCell>
                          <Badge variant={product.is_add_on ? "default" : "secondary"}>
                            {product.is_add_on ? "Add-on" : "Regular"}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes("status") && (
                        <TableCell>
                          <Badge variant={product.is_active ? "default" : "destructive"}>
                            {product.is_active ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes("actions") && (
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product)
                                setIsFormOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteClick(product)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length} className="text-center">
                      {searchTerm ? "No matching products found" : "No products found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > itemsPerPage && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      if (i === 0) pageNum = currentPage - 1
                      else if (i === 1) pageNum = currentPage
                      else if (i === 2) pageNum = currentPage + 1
                      else if (i === 3) pageNum = totalPages - 1
                      else pageNum = totalPages
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(pageNum)
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <ProductForm
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        product={editingProduct}
        onCreate={onCreate}
        onUpdate={onUpdate}
        uploadProductImage={uploadProductImage}
        deleteProductImage={deleteProductImage}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product and remove its data from servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
